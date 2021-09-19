const router = require('express').Router();
const webhooks = require('./webhooks');
const endpoints = require('./endpoints');

router.use('/webhooks', webhooks);
router.use('/endpoints', endpoints);

module.exports = router;
