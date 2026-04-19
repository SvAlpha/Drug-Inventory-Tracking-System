const StockItem = require('../models/StockItem');
const SupplyOrder = require('../models/SupplyOrder');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Headquarters = require('../models/Headquarters');

// @route  GET /api/stock
// @access All roles
const getAllStock = async (req, res) => {
  try {
    const stock = await StockItem.find().populate('managedBy', 'name email');
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/stock
// @access hq_admin
const addStock = async (req, res) => {
  try {
    const { drugName, category, currentLevel, criticalLimit, unit } = req.body;

    const drug = await StockItem.create({
      drugName, category, currentLevel, criticalLimit,
      unit: unit || 'units',
      managedBy: req.user.id
    });

    await AuditLog.create({
      userId: req.user.id, userRole: req.user.role,
      action: 'STOCK_ADDED',
      description: `Added drug: ${drugName} with initial stock ${currentLevel}`
    });

    res.status(201).json(drug);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/stock/:id
// @access hq_admin
const updateStock = async (req, res) => {
  try {
    const drug = await StockItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!drug) return res.status(404).json({ message: 'Drug not found.' });

    await AuditLog.create({
      userId: req.user.id, userRole: req.user.role,
      action: 'STOCK_UPDATED',
      description: `Updated drug: ${drug.drugName}`
    });

    res.json(drug);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  DELETE /api/stock/:id
// @access hq_admin
const deleteStock = async (req, res) => {
  try {
    const drug = await StockItem.findByIdAndDelete(req.params.id);
    if (!drug) return res.status(404).json({ message: 'Drug not found.' });

    await AuditLog.create({
      userId: req.user.id, userRole: req.user.role,
      action: 'STOCK_DELETED',
      description: `Deleted drug: ${drug.drugName}`
    });

    res.json({ message: 'Drug deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Called internally by consumeController after decrement
// Checks threshold -> creates Notification + SupplyOrder if critical
const decrementAndCheck = async (drugId, quantityConsumed, adminId) => {
  const drug = await StockItem.findByIdAndUpdate(
    drugId,
    { $inc: { currentLevel: -quantityConsumed } },
    { new: true }
  );

  if (!drug) throw new Error('Drug not found during decrement.');

  // Threshold check
  if (drug.currentLevel <= drug.criticalLimit) {
    // Find HQ admin to link notification and PO
    const admin = await Headquarters.findById(adminId) || await Headquarters.findOne();

    // Create notification for HQ dashboard
    await Notification.create({
      recipientId: admin._id,
      recipientRole: 'hq_admin',
      message: `ALERT: ${drug.drugName} stock is critically low (${drug.currentLevel} ${drug.unit} remaining). Auto PO generated.`,
      isRead: false
    });

    // Auto-generate Supply Order (Purchase Order)
    const restockQuantity = drug.criticalLimit * 3; // order 3x critical limit
    const po = await SupplyOrder.create({
      drugId: drug._id,
      quantity: restockQuantity,
      status: 'Pending',
      generatedBy: admin._id,
      fulfilledBy: null
    });

    await AuditLog.create({
      userId: admin._id,
      userRole: 'hq_admin',
      action: 'PO_CREATED',
      description: `Auto PO created for ${drug.drugName} — quantity: ${restockQuantity}`
    });

    return { drug, poCreated: true, po };
  }

  return { drug, poCreated: false };
};

module.exports = { getAllStock, addStock, updateStock, deleteStock, decrementAndCheck };
