require("dotenv").config();

const {
    getProductById,
    getProductByHandle,
    getVariantBySKU
} = require("../../graphql/products/queries/product.query");

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
}

module.exports = { ProductService };
