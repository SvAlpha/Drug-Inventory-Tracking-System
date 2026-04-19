const mongoose = require('mongoose');

const supplyOrderSchema = new mongoose.Schema({
  drugId:      { type: mongoose.Schema.Types.ObjectId, ref: 'StockItem', required: true },
  quantity:    { type: Number, required: true },
  status:      {
    type: String,
    enum: ['Pending', 'Confirmed', 'In-Transit', 'Out-for-Delivery', 'Delivered'],
    default: 'Pending'
  },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Headquarters', required: true },
  fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', default: null }
}, { timestamps: true });

module.exports = mongoose.model('SupplyOrder', supplyOrderSchema);
