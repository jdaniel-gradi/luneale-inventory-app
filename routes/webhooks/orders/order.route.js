const router = require("express").Router();

const OrderController = require("../../../controllers/orders/order.controller");

const orderController = new OrderController();

router.post("/order-created", orderController.handleNewOrder);

module.exports = router;
