const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, required: true },
  userRole:    { type: String, required: true },
  action:      {
    type: String,
    enum: ['LOGIN', 'LOGOUT', 'STOCK_UPDATED', 'STOCK_ADDED', 'STOCK_DELETED',
           'PO_CREATED', 'PO_STATUS_CHANGED', 'VENDOR_ASSIGNED',
           'CONSUMPTION_LOGGED', 'DELIVERY_ACKNOWLEDGED'],
    required: true
  },
  description: { type: String, required: true },
  performedAt: { type: Date, default: Date.now }
}, { timestamps: false });

module.exports = mongoose.model('AuditLog', auditLogSchema);
