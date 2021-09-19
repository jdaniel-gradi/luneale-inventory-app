const router = require("express").Router();

const OrderController = require("../../../controllers/orders/order.controller");

const orderController = new OrderController();

router.post("/send-email", orderController.shipupOrder);
router.post("/order-created", orderController.handleNewOrder);

module.exports = router;
