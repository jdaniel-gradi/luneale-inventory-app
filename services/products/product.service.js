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

    async reduceBundleInventories(arr) {
        for (const subProd of arr) {
        }
    }
}

module.exports = { ProductService };
