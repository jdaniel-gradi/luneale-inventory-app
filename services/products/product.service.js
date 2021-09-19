require("dotenv").config();

const {
    getProductById,
    getProductByHandle,
    getVariantBySKU
} = require("../../graphql/products/queries/product.query");

const graphQLClient = require("../../graphql");

const { OrderService } = require("../orders/order.service");
const orderServiceInstance = new OrderService();

const { SHOPIFY_GQL_ENDPOINT: gql_url, SHOPIFY_GQL_BASEID: gql_baseId } = process.env;

class ProductService {
    constructor() {
        this.baseUrl = gql_url;
        this.baseGQLId = gql_baseId;
    }

    async getProduct(productId) {
        const response = await graphQLClient.request(getProductById, {
            id: `${this.baseGQLId}/Product/${productId}`
        });

        return response;
    }

    async getProductByHandle(productHandle) {
        const response = await graphQLClient.request(getProductByHandle, {
            handle: productHandle
        });

        return response;
    }

    async getVariantBySKU(sku) {
        const response = await graphQLClient.request(getVariantBySKU, {
            sku: `sku:${sku}`
        });

        return response;
    }

    async getBundleSubProducts(line_items) {
        const data = [];

        for (const item of line_items) {
            const { product_id, quantity, properties } = item;
            try {
                const response = await this.getProduct(product_id);
                const { product } = response;

                if (!product.tags.includes("package")) continue;

                // If the product is a bundle, get inner products' handles from tags
                const innerProducts = product.tags
                    .filter(tag => tag.match(/^product-/))
                    .map(el => el.split("product-")[1]);

                if (innerProducts.length === 0) continue;

                data.push({
                    bundleTitle: product.title,
                    subproductHandles: innerProducts,
                    quantity,
                    properties
                });
            } catch (err) {
                console.error(err);

                return null;
            }
        }

        return data;
    }

    async handleReduceInventories(item, orderId) {
        // item includes line_item info: subproduct handles, properties and quantity
        const { quantity } = item;
        let response;

        console.log("Begin order edit");
        response = await orderServiceInstance.beginOrderEdit(orderId);
        console.log(response);
        let order = response.orderEditBegin.calculatedOrder;

        for (const handle of item.subproductHandles) {
            // Product info includes variant info (with inventory item and levels), see /graphql/products/queries/product.query.js
            response = await this.getProductByHandle(handle);
            const { productByHandle: productInfo } = response;

            if (!productInfo) {
                console.log(`Could not find product with handle ${handle}`);
                continue;
            }

            console.log("Product Info");
            console.log("--------------------------------------");
            console.log(productInfo);

            const { title } = productInfo;

            const prop = item.properties.find(el => el.name == `_SKU ${title}`);

            if (!prop) {
                console.log(`Could not find SKU for product ${title}`);
                continue;
            }

            const { value: SKU } = prop;

            const variantInfo = productInfo.variants.edges.find(el => el.node.sku == SKU).node;

            console.log("Variant info found:");
            console.log("----------------------------------");
            console.log(JSON.stringify(variantInfo, 0, 2));

            // Add variant to order
            console.log(`Adding variant ${variantInfo.title} to order`);
            response = await orderServiceInstance.addVariantOrderEdit(
                order.id,
                variantInfo.id,
                quantity
            );
            console.log(response);
            order = response.orderEditAddVariant.calculatedOrder;

            const newLineItem = order.addedLineItems.edges.find(
                el => el.node.title == productInfo.title
            ).node;

            console.log("Adding full discount");
            response = await orderServiceInstance.addFullDiscountOrderEditLineItem(
                order.id,
                newLineItem.id
            );
            console.log(response);
        }

        console.log("Commit changes made to order");
        response = await orderServiceInstance.endOrderEdit(order.id);
        console.log(response);
    }
}

module.exports = { ProductService };
