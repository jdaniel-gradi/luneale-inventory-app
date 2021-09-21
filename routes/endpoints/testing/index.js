const router = require("express").Router();
const getProduct = require("./getProduct");
const getVariant = require("./getVariant");

router.use("/get-product", getProduct);
router.use("/get-variant", getVariant);

module.exports = router;
