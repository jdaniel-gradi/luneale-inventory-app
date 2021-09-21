const { default: axios } = require("axios");
const ShopifyAPI = require("../utils/shopifyAPI.util");
const shopifyAPIInstance = new ShopifyAPI();

const instance = axios.create({
    headers: {
        common: shopifyAPIInstance.getAPIHeaders()
    }
});

module.exports = instance;
