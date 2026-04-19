const mongoose = require('mongoose');

const consumptionLogSchema = new mongoose.Schema({
  hospitalId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  drugId:           { type: mongoose.Schema.Types.ObjectId, ref: 'StockItem', required: true },
  quantityConsumed: { type: Number, required: true, min: 1 },
  stockLevelAfter:  { type: Number, required: true } // snapshot at time of consumption
}, { timestamps: true });

// Compound index for fast queries: "all logs for this hospital" or "all logs for this drug"
consumptionLogSchema.index({ hospitalId: 1, drugId: 1 });

module.exports = mongoose.model('ConsumptionLog', consumptionLogSchema);
