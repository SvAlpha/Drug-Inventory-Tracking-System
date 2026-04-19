const mongoose = require('mongoose');

const shipmentTrackingSchema = new mongoose.Schema({
  orderId:  { type: mongoose.Schema.Types.ObjectId, ref: 'SupplyOrder', required: true },
  status:   {
    type: String,
    enum: ['Confirmed', 'In-Transit', 'Out-for-Delivery', 'Delivered'],
    required: true
  },
  location: { type: String, default: '' },
  note:     { type: String, default: '' },
  updatedAt:{ type: Date, default: Date.now }
}, { timestamps: false });

// Insert-only pattern: every status change = new document, never update existing
module.exports = mongoose.model('ShipmentTracking', shipmentTrackingSchema);
