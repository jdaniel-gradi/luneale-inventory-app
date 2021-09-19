require("dotenv").config();

module.exports = class ShopifyAPIUtil {
    constructor(token = null) {
        token = token || process.env.SHOPIFY_API_PWD;
        this.headers = {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": token
        };
    }

    getAPIHeaders = () => this.headers;
};
