// Package (All npm package)
require("dotenv").config();

// Requires (Service, Utils, graphql[query, mutations, etc...])
const { OrderService } = require("../../services/orders/order.service");
const { ProductService } = require("../../services/products/product.service");

// Instances (All class instances)
const orderServiceInstance = new OrderService();
const productServiceInstance = new ProductService();

class Order {
    async shipupOrder(req, res) {
        if (!req.body) return res.sendStatus(200);

        const { id: orderId } = req.body;

        const emailTokenized = `c8585${orderId}@shipup.io`;

        let data = {
            order: {
                id: orderId,
                note: emailTokenized
            }
        };

        try {
            const serverResponse = await orderServiceInstance.updateOrder(orderId, data);

            return res.status(200).json({
                response: `Added a note with ${emailTokenized}`,
                serverResponse
            });
        } catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }
    }

    async handleNewOrder(req, res) {
        if (!req.body) return res.sendStatus(200);

        const { id: orderId, line_items, email } = req.body;

        // ! Only moves forward if customer email address has a gradiweb.com domain (remove before going live!!!!)

        if (!email.includes("gradiweb.com")) return res.sendStatus(200);

        console.log(`Received webhook for the creation of order ID#${orderId}`);

        // * 1. Get subproducts of bundles if any

        const pendingMods = await productServiceInstance.getBundleSubProducts(line_items);

        if (!pendingMods) return res.sendStatus(500);

        if (pendingMods.length > 0) {
            // Found bundle subproducts
            console.log("Found bundle subproducts!");
            console.log(JSON.stringify(pendingMods, 0, 2));

            for (const mod of pendingMods) {
                try {
                    const response = await productServiceInstance.handleReduceInventories(
                        mod,
                        orderId
                    );

                    console.log(response);
                } catch (err) {
                    console.error(err);
                }
            }
        }
        return res.sendStatus(200);
    }
}

module.exports = Order;
