const User = require('../Models/User.js');
const Settings = require('../Models/Settings.js');
const axios = require('axios');

exports.getCurrentRate = async (req, res) => {
    const { currency } = req.params;
    try {
        const settings = await Settings.findOne({ currency });
        if (settings?.useManualRate) return res.json({ success: true, settings });
        try {
            const apiRes = await axios.get('https://open.er-api.com/v6/latest/USD', { timeout: 8000 });
            const liveRate = apiRes.data?.rates?.[currency] || 1;
            return res.json({ success: true, settings: { currency, useManualRate: false, manualRate: liveRate } });
        } catch (apiErr) {
            console.error('Live rate request failed; using saved/default rate:', apiErr.message);
            return res.json({ success: true, settings: settings || { currency, useManualRate: false, manualRate: 1 } });
        }
    } catch (err) {
        return res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

exports.getPaymentMethods = async (req, res) => {
    const methodsByCountry = {
        ET: [
            { name: 'Telebirr', icon: '📱', color: 'bg-blue-600', account: '0993501570' },
            { name: 'CBE Bank', icon: '🏦', color: 'bg-purple-700', account: '1000...' },
            { name: 'Abyssinia Bank', icon: '🏛️', color: 'bg-yellow-600', account: '8877...' }
        ],
        UG: [
            { name: 'MTN MoMo', icon: '🟡', color: 'bg-yellow-500 text-black', account: '0707415421' },
            { name: 'Airtel Money', icon: '🔴', color: 'bg-red-600', account: '0707415421' }
        ],
        AO: [
            { name: 'Unitel Money', icon: '📱', color: 'bg-orange-500 text-white', account: '00244...' },
            { name: 'BAI Bank', icon: '🏦', color: 'bg-blue-800 text-white', account: 'AO06...' }
        ],
        SS: [
            { name: 'm-GURUSH', icon: '💰', color: 'bg-green-600 text-white', account: '092...' },
            { name: 'Nile Bank', icon: '🏛️', color: 'bg-gray-800 text-white', account: '100...' }
        ],
        KE: [
            { name: 'M-Pesa', icon: '🟢', color: 'bg-green-500 text-white', account: '07...' },
            { name: 'Equity Bank', icon: '🏦', color: 'bg-red-700 text-white', account: '254...' }
        ]
    };
    return res.json({ success: true, methods: methodsByCountry[req.params.country] || [{ name: 'Visa / Card', icon: '💳', color: 'bg-gray-700 text-white', account: 'Online Checkout' }] });
};

exports.getCurrentUser = async (req, res) => {
    const phone = req.query.phone;
    if (!phone) return res.status(400).json({ success: false, msg: 'Phone is required.' });
    try {
        const user = await User.findOne({ phoneNumber: phone });
        if (!user) return res.status(404).json({ success: false, msg: 'User not found' });
        const currencyByCountry = { ET: 'ETB', UG: 'UGX', AO: 'AOA', SS: 'SSP', KE: 'KES', SD: 'SDG' };
        return res.status(200).json({ success: true, phone: user.phoneNumber, currency: currencyByCountry[user.country] || user.currency || 'USD' });
    } catch (err) {
        return res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

exports.getUserMinutes = async (req, res) => {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ success: false, msg: 'Phone is required.' });
    try {
        const user = await User.findOne({ phoneNumber: phone });
        if (!user) return res.status(404).json({ success: false, msg: 'User not found' });
        return res.status(200).json({ success: true, minutes: user.minutes, currency: user.currency });
    } catch (err) {
        return res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

exports.addMinutes = async (req, res) => {
    const { phone, minutesToAdd } = req.body;
    const amount = Number(minutesToAdd);
    if (!phone || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, msg: 'Phone and positive minutesToAdd are required.' });
    try {
        const user = await User.findOne({ phoneNumber: phone });
        if (!user) return res.status(404).json({ success: false, msg: 'User not found' });
        const [m, s] = String(user.minutes || '0:00').split(':').map(Number);
        const totalSeconds = ((m || 0) * 60) + (s || 0) + (amount * 60);
        user.minutes = `${Math.floor(totalSeconds / 60)}:${String(Math.floor(totalSeconds % 60)).padStart(2, '0')}`;
        await user.save();
        return res.status(200).json({ success: true, minutes: user.minutes });
    } catch (err) {
        return res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

exports.updateMinutes = async (req, res) => {
    const { phone, remainingMinutes } = req.body;
    if (!phone || typeof remainingMinutes !== 'string' || !/^\d+:([0-5]\d)$/.test(remainingMinutes)) return res.status(400).json({ success: false, msg: 'Phone and minutes in M:SS format are required.' });
    try {
        const user = await User.findOneAndUpdate({ phoneNumber: phone }, { $set: { minutes: remainingMinutes } }, { returnDocument: 'after' });
        if (!user) return res.status(404).json({ success: false, msg: 'User not found' });
        return res.status(200).json({ success: true, minutes: user.minutes });
    } catch (err) {
        console.error('Update Minutes Error:', err);
        return res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

exports.checkDevice = async (req, res) => {
    const { phone, deviceId } = req.body;
    if (!phone || !deviceId) return res.status(400).json({ success: false, msg: 'Phone and device ID are required.' });
    try {
        const user = await User.findOne({ phoneNumber: phone });
        if (!user) return res.status(404).json({ success: false, msg: 'User not found' });
        if (user.deviceId && user.deviceId !== deviceId) return res.json({ action: 'BLOCK', msg: 'Device mismatch' });
        if (!user.deviceId) { user.deviceId = deviceId; await user.save(); }
        return res.json({ action: 'ALLOW' });
    } catch (err) {
        console.error('Check Device Error:', err);
        return res.status(500).json({ success: false, msg: 'Server Error' });
    }
};