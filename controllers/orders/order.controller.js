// Package (All npm package)
require("dotenv").config();

// Requires (Service, Utils, graphql[query, mutations, etc...])
const { OrderService } = require("../../services/orders/order.service");
const { ProductService } = require("../../services/products/product.service");

// Instances (All class instances)
const orderServiceInstance = new OrderService();
const productServiceInstance = new ProductService();

class Order {
    async handleNewOrder(req, res) {
        if (!req.body) return res.sendStatus(200);

        console.log(JSON.stringify(req.body));

        const { id: orderId, line_items, email, order_number: orderNumber } = req.body;

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
            let response = await productServiceInstance.reduceBundleInventories(pendingMods);

            // Reduce function returns array of objects with productId, tax rate and provided price (product metafield) for further processing
            console.log("response:", response);

            // Aggregate tax rules array into object with unique rates as keys
            const taxes = {};

            for (const rule of response) {
                const { price, quantity } = rule;
                const VAT = rule.VAT / 100;

                taxes[VAT] = taxes[VAT] || 0;
                taxes[VAT] += (price / (1 + VAT)) * quantity * VAT;
            }

            console.log(taxes);

            // In addition to bundle products, other line_items should have their taxes added
            const bundleProductIds = pendingMods.map(el => {
                // Might be in GQL format
                let bundleId = el.bundleDetails.product.id;
                if (bundleId.includes("/")) bundleId = bundleId.split("/");
                const productId = typeof bundleId == "string" ? bundleId : bundleId.slice(-1)[0];

                return productId;
            });

            const nonBundleItems = line_items.filter(
                el => !bundleProductIds.includes(el.product_id)
            );

            console.log("Found non-bundle items in order");

            if (nonBundleItems.length) {
                for (const item of nonBundleItems) {
                    for (const taxLine of item.tax_lines) {
                        taxes[taxLine.rate] = taxes[taxLine.rate] || 0;
                        taxes[taxLine.rate] += parseFloat(taxLine.price);
                    }
                }
            }

            // Create note in order that lays out collected info
            let note = "Collected taxes:\n";

            for (const k in Object.keys(taxes)) {
                note += `${parseFloat(k) * 100}%: ${taxes[k]}\n`;
            }

            response = await orderServiceInstance.updateOrderNote(orderId, note);

            console.log(`Added the following note to order #${orderNumber}:`);
            console.log(note);
        } catch (err) {
            console.error(err);
            return res.sendStatus(500);
        }

        return res.sendStatus(200);
    }
}

module.exports = Order;
