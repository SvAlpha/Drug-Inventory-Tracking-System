const ConsumptionLog = require('../models/ConsumptionLog');
const AuditLog = require('../models/AuditLog');
const { decrementAndCheck } = require('./stockController');

// @route  POST /api/consume
// @access hospital_staff
// THIS IS THE TRIGGER — logs usage -> decrements stock -> checks threshold -> auto PO if critical
const logConsumption = async (req, res) => {
  try {
    const { drugId, quantityConsumed } = req.body;

    if (!drugId || !quantityConsumed || quantityConsumed < 1) {
      return res.status(400).json({ message: 'drugId and quantityConsumed (min 1) are required.' });
    }

    // Decrement stock and check threshold (auto PO if critical)
    const { drug, poCreated, po } = await decrementAndCheck(drugId, quantityConsumed, req.user.id);

    // Save consumption log with stock snapshot
    const log = await ConsumptionLog.create({
      hospitalId: req.user.id,
      drugId,
      quantityConsumed,
      stockLevelAfter: drug.currentLevel
    });

    await AuditLog.create({
      userId: req.user.id,
      userRole: req.user.role,
      action: 'CONSUMPTION_LOGGED',
      description: `Hospital logged ${quantityConsumed} units of ${drug.drugName}. Stock now: ${drug.currentLevel}`
    });

    res.status(201).json({
      message: 'Consumption logged successfully.',
      log,
      stockLevelAfter: drug.currentLevel,
      criticalAlert: poCreated,
      purchaseOrderCreated: poCreated ? po._id : null
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/consume
// @access hq_admin
const getAllLogs = async (req, res) => {
  try {
    const logs = await ConsumptionLog.find()
      .populate('hospitalId', 'hospitalName location')
      .populate('drugId', 'drugName category unit')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/consume/my
// @access hospital_staff
const getMyLogs = async (req, res) => {
  try {
    const logs = await ConsumptionLog.find({ hospitalId: req.user.id })
      .populate('drugId', 'drugName category unit')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { logConsumption, getAllLogs, getMyLogs };
