const AuditLog = require('../models/AuditLog');

// @route  GET /api/audit
// @access hq_admin only
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ performedAt: -1 })
      .limit(200); // last 200 actions
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAuditLogs };
