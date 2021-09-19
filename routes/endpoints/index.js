const router = require("express").Router();
const testing = require("./testing");

router.use("/testing", testing);

module.exports = router;
