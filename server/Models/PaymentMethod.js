const mongoose = require('mongoose');

const PaymentMethodSchema = new mongoose.Schema({
    country: String, // ET, UG, US...
    name: String,    // Telebirr, MTN...
    icon: String,    // 📱
    color: String,   // bg-blue-600
    account: String, // 0993...
    isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('PaymentMethod', PaymentMethodSchema);