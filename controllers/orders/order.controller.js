// Package (All npm package)
require("dotenv").config();

// Requires (Service, Utils, graphql[query, mutations, etc...])
const { ProductService } = require("../../services/products/product.service");

// Instances (All class instances)
const productServiceInstance = new ProductService();

class Order {
    async handleNewOrder(req, res) {
        if (!req.body) return res.sendStatus(200);

        const { id: orderId, line_items, email } = req.body;

        // ! Only moves forward if customer email address has a gradiweb.com domain (remove before going live!!!!)

        if (!email.includes("gradiweb.com")) return res.sendStatus(200);

        console.log(`Received webhook for the creation of order ID#${orderId}`);

        // * 1. Get subproducts of bundles if any

        const pendingMods = await productServiceInstance.getBundleSubProducts(line_items);

        if (!pendingMods) return res.sendStatus(500);

        if (pendingMods.length == 0) return res.sendStatus(200);

        // Found bundle subproducts
        console.log("Found bundle subproducts!");
        console.log(JSON.stringify(pendingMods, 0, 2));

        try {
            const response = await productServiceInstance.reduceBundleInventories(pendingMods);

            console.log(response);
        } catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }

        return res.sendStatus(200);
    }
}

module.exports = Order;
