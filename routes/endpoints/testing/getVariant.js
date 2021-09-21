const router = require("express").Router();

const { ProductService } = require("../../../services/products/product.service");
const productServiceInstance = new ProductService();

router.get("/:variantId", async (req, res) => {
    const { variantId } = req.params;

    try {
        const response = await productServiceInstance.getVariant(variantId);

        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

module.exports = router;
