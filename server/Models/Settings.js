const mongoose = require('mongoose');
const SettingsSchema = new mongoose.Schema({
  currency: String,
  useManualRate: { type: Boolean, default: false },
  manualRate: Number
});
module.exports = mongoose.model('Settings', SettingsSchema);