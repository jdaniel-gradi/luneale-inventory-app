require("dotenv").config();

const {
    getProductById,
    getProductByHandle,
    getVariant,
    getVariantBySKU
} = require("../../graphql/products/queries/product.query");

const { adjustInventoryQuantity } = require("../../graphql/inventory/mutations/inventory.mutation");

const graphQLClient = require("../../graphql");

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
            const { product_id, quantity, properties, variant_id, variant_title } = item;
            try {
                const response = await this.getProduct(product_id);
                const { product } = response;

                if (product.productType != "Pack") continue;

                // If the product is a bundle, get inner products' handles from 'bundle_price' metafield (JSON)

                const bundlePriceObj = product.metafields.edges.find(
                    el => el.node.key == "bundle_price"
                ).node;

                const value = JSON.parse(bundlePriceObj.value);

                data.push({
                    bundleDetails: {
                        duo: product.tags.includes("pack|duo"),
                        product: {
                            title: product.title,
                            id: product.id
                        },
                        variant: {
                            title: variant_title,
                            id: variant_id
                        }
                    },
                    subproducts: value,
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

    async reduceInventory(id, quantity) {
        const response = await graphQLClient.request(adjustInventoryQuantity, {
            input: {
                inventoryLevelId: id,
                availableDelta: parseInt(quantity)
            }
        });

        return response;
    }

    async reduceBundleInventories(arr) {
        const taxRules = [];
        let processedCup = false;

        for (const bundle of arr) {
            const { quantity, bundleDetails } = bundle;
            for (const subProd of bundle.subproducts) {
                let variantTitle;

                let response = await this.getProductByHandle(subProd.handle);

                const product = response.product;

                if (bundle.duo && subProd.handle.includes("cup")) {
                    const arr = bundleDetails.variant.title.split("/").map(el => el.trim());
                    variantTitle = processedCup ? arr[1] : arr[0];
                } else {
                    variantTitle = bundle.variant.title;
                }

                const variant = product.variants.edges
                    .map(el => el.node)
                    .find(el => el.title == variantTitle);

                if (!variant) return;

                // Extract product VAT rate from metafields
                const VAT = product.metafields.edges
                    .map(el => el.node)
                    .find(el => el.namespace == "my_fields" && el.key == "vat").value;

                taxRules.push({
                    productId: product.id,
                    VAT: parseFloat(VAT),
                    price: parseFloat(subProd.price),
                    quantity
                });

                const invLevelId = variant.inventoryItem.inventoryLevels.edges.find(
                    el => el.node.available > 0
                ).node.id;

                response = await this.reduceInventory(invLevelId, quantity);
                console.log(
                    `Reduced inventory of variant ${subProd.bundleDetails.variant.title} from product ${subProd.bundleDetails.product.title} by ${quantity}`
                );
            }
        }

        return taxRules;
    }
}

module.exports = { ProductService };
