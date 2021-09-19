const router = require("express").Router();
const order = require("./orders/order.route");

router.use("/orders", order);

module.exports = router;
