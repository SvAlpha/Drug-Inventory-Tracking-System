const ShipmentTracking = require('../models/ShipmentTracking');
const SupplyOrder = require('../models/SupplyOrder');

// @route  GET /api/shipment/:orderId
// @access All roles
const getShipmentTimeline = async (req, res) => {
  try {
    const order = await SupplyOrder.findById(req.params.orderId)
      .populate('drugId', 'drugName category')
      .populate('fulfilledBy', 'companyName');

    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Full timeline - all status entries in chronological order
    const timeline = await ShipmentTracking.find({ orderId: req.params.orderId })
      .sort({ updatedAt: 1 });

    res.json({ order, timeline });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getShipmentTimeline };
