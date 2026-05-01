const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    minutes: { type: String, default: "10:00" },
    currency: { type: String, default: "USD" },
    country: { type: String, default: "Unknown" }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);