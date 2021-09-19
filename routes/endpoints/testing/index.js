const router = require("express").Router();
const getProduct = require("./getProduct");

router.use("/get-product", getProduct);

module.exports = router;
