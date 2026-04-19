const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  recipientRole: { type: String, required: true },
  message:       { type: String, required: true },
  isRead:        { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
