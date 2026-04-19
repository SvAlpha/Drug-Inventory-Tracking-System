const mongoose = require('mongoose');

const stockItemSchema = new mongoose.Schema({
  drugName:     { type: String, required: true },
  category:     { type: String, required: true },
  currentLevel: { type: Number, required: true, min: 0 },
  criticalLimit:{ type: Number, required: true, min: 0 },
  unit:         { type: String, default: 'units' }, // e.g. tablets, vials, bottles
  managedBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'Headquarters', required: true }
}, { timestamps: true });

module.exports = mongoose.model('StockItem', stockItemSchema);
