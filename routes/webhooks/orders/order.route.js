const router = require("express").Router();

const OrderController = require("../../../controllers/orders/order.controller");

const orderController = new OrderController();

router.post("/order-created", orderController.handleNewOrder);
router.post("/order-cancelled", orderController.handleCancelledOrder);

module.exports = router;
