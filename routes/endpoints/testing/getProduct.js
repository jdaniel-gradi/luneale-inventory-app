const router = require("express").Router();

const { ProductService } = require("../../../services/products/product.service");
const productServiceInstance = new ProductService();

router.get("/:productHandle", async (req, res) => {
    const { productHandle } = req.params;

    try {
        const response = await productServiceInstance.getProductByHandle(productHandle);

        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});

module.exports = router;
