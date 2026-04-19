const SupplyOrder = require('../models/SupplyOrder');
const ShipmentTracking = require('../models/ShipmentTracking');
const StockItem = require('../models/StockItem');
const AuditLog = require('../models/AuditLog');

// @route  GET /api/orders
// @access All roles (filtered by role)
const getOrders = async (req, res) => {
  try {
    let query = {};

    // Vendor only sees orders assigned to them
    if (req.user.role === 'vendor') {
      query.fulfilledBy = req.user.id;
    }

    const orders = await SupplyOrder.find(query)
      .populate('drugId', 'drugName category unit')
      .populate('generatedBy', 'name email')
      .populate('fulfilledBy', 'companyName contactNumber')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/orders/:id/assign
// @access hq_admin
const assignVendor = async (req, res) => {
  try {
    const { vendorId } = req.body;

    const order = await SupplyOrder.findByIdAndUpdate(
      req.params.id,
      { fulfilledBy: vendorId, status: 'Confirmed' },
      { new: true }
    ).populate('drugId', 'drugName');

    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Create first ShipmentTracking entry
    await ShipmentTracking.create({
      orderId: order._id,
      status: 'Confirmed',
      note: 'Vendor assigned and order confirmed.'
    });

    await AuditLog.create({
      userId: req.user.id, userRole: req.user.role,
      action: 'VENDOR_ASSIGNED',
      description: `Vendor assigned to PO for ${order.drugId.drugName}`
    });

    res.json({ message: 'Vendor assigned successfully.', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/orders/:id/status
// @access vendor
const updateOrderStatus = async (req, res) => {
  try {
    const { status, location, note } = req.body;
    const validStatuses = ['Confirmed', 'In-Transit', 'Out-for-Delivery', 'Delivered'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await SupplyOrder.findById(req.params.id).populate('drugId');
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Ensure vendor owns this order
    if (order.fulfilledBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You are not assigned to this order.' });
    }

    // Update order status
    order.status = status;
    await order.save();

    // Insert-only: new ShipmentTracking row for every status change
    await ShipmentTracking.create({
      orderId: order._id,
      status,
      location: location || '',
      note: note || ''
    });

    // If delivered: increment stock level back up
    if (status === 'Delivered') {
      await StockItem.findByIdAndUpdate(
        order.drugId._id,
        { $inc: { currentLevel: order.quantity } }
      );

      await AuditLog.create({
        userId: req.user.id, userRole: req.user.role,
        action: 'DELIVERY_ACKNOWLEDGED',
        description: `PO delivered. ${order.quantity} units of ${order.drugId.drugName} restocked.`
      });
    }

    await AuditLog.create({
      userId: req.user.id, userRole: req.user.role,
      action: 'PO_STATUS_CHANGED',
      description: `PO status updated to ${status} for order ${order._id}`
    });

    res.json({ message: `Order status updated to ${status}.`, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getOrders, assignVendor, updateOrderStatus };
