const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getShipmentTimeline } = require('../controllers/shipmentController');

router.get('/:orderId', protect, getShipmentTimeline);

module.exports = router;
