// const express = require('express');
// const router = express.Router();
// const User = require('../Models/User.js');
// const axios = require('axios');
// const Settings = require('../Models/Settings.js');

// // Get current currency rate API
// router.get('/get-current-rate/:currency', async (req, res) => {
//     const { currency } = req.params;
//     try {
//         const settings = await Settings.findOne({ currency: currency });

//         if (settings && settings.useManualRate) {
//             return res.json({ success: true, settings });
//         }

//         try {
//             const apiRes = await axios.get('https://open.er-api.com/v6/latest/USD');
//             const liveRates = apiRes.data.rates;
//             const liveRateForCurrency = liveRates[currency] || 1;

//             return res.json({
//                 success: true,
//                 settings: {
//                     currency: currency,
//                     useManualRate: false,
//                     manualRate: liveRateForCurrency
//                 }
//             });
//         } catch (apiErr) {
//             console.log("❌ Internet Rate Fetch Error, falling back to DB if exists");
//             return res.json({
//                 success: true,
//                 settings: settings || { currency: currency, useManualRate: false, manualRate: 1 }
//             });
//         }
//     } catch (err) {
//         res.status(500).json({ success: false, msg: "Server Error" });
//     }
// });

// // Payment Methods API
// router.get('/payment-methods/:country', async (req, res) => {
//     const { country } = req.params;
//     try {
//         const initialMethods = {
//             ET: [
//                 { name: "Telebirr", icon: "📱", color: "bg-blue-600", account: "0993501570" },
//                 { name: "CBE Bank", icon: "🏦", color: "bg-purple-700", account: "1000..." },
//                 { name: "Abyssinia Bank", icon: "🏛️", color: "bg-yellow-600", account: "8877..." }
//             ],
//             UG: [
//                 { name: "MTN MoMo", icon: "🟡", color: "bg-yellow-500 text-black", account: "0707415421" },
//                 { name: "Airtel Money", icon: "🔴", color: "bg-red-600", account: "0707415421" }
//             ],
//             AO: [
//                 { name: "Unitel Money", icon: "📱", color: "bg-orange-500 text-white", account: "00244..." },
//                 { name: "BAI Bank", icon: "🏦", color: "bg-blue-800 text-white", account: "AO06..." }
//             ],
//             SS: [
//                 { name: "m-GURUSH", icon: "💰", color: "bg-green-600 text-white", account: "092..." },
//                 { name: "Nile Bank", icon: "🏛️", color: "bg-gray-800 text-white", account: "100..." }
//             ],
//             KE: [
//                 { name: "M-Pesa", icon: "🟢", color: "bg-green-500 text-white", account: "07..." },
//                 { name: "Equity Bank", icon: "🏦", color: "bg-red-700 text-white", account: "254..." }
//             ],
//             DEFAULT: [
//                 { name: "Visa / Card", icon: "💳", color: "bg-gray-700 text-white", account: "Online Checkout" }
//             ]
//         };

//         const methods = initialMethods[country] || initialMethods.DEFAULT;
//         res.json({ success: true, methods });
//     } catch (err) {
//         res.status(500).json({ success: false, msg: "Server Error" });
//     }
// });

// // Current User API
// router.get('/current-user', async (req, res) => {
//     const phone = req.query.phone;
//     try {
//         let user;
//         if (phone) {
//             user = await User.findOne({ phoneNumber: phone });
//         } else {
//             user = await User.findOne().sort({ createdAt: -1 });
//         }

//         if (!user) {
//             return res.status(404).json({ success: false, msg: "User not found" });
//         }

//         let autoCurrency = user.currency || 'USD';

//         if (user.country === 'ET') autoCurrency = 'ETB';
//         else if (user.country === 'UG') autoCurrency = 'UGX';
//         else if (user.country === 'AO') autoCurrency = 'AOA';
//         else if (user.country === 'SS') autoCurrency = 'SSP';
//         else if (user.country === 'KE') autoCurrency = 'KES';
//         else if (user.country === 'SD') autoCurrency = 'SDG';

//         res.status(200).json({
//             success: true,
//             phone: user.phoneNumber,
//             currency: autoCurrency
//         });
//     } catch (err) {
//         res.status(500).json({ success: false, msg: "Server Error" });
//     }
// });

// // User Minutes API
// router.get('/user-minutes', async (req, res) => {
//     const { phone } = req.query;
//     try {
//         const user = await User.findOne({ phoneNumber: phone });
//         if (!user) {
//             return res.status(404).json({ success: false, msg: "User not found" });
//         }
//         res.status(200).json({ success: true, minutes: user.minutes, currency: user.currency });
//     } catch (err) {
//         res.status(500).json({ success: false, msg: "Server Error" });
//     }
// });

// // Add Minutes API
// router.put('/add-minutes', async (req, res) => {
//     const { phone, minutesToAdd } = req.body;
//     try {
//         const user = await User.findOne({ phoneNumber: phone });
//         if (!user) {
//             return res.status(404).json({ success: false, msg: "User not found" });
//         }

//         const [m, s] = user.minutes.split(':').map(Number);
//         const currentTotalSeconds = (m * 60) + (s || 0);
//         const finalTotalSeconds = currentTotalSeconds + (Number(minutesToAdd) * 60);
//         const finalMinutes = Math.floor(finalTotalSeconds / 60);
//         const finalSeconds = finalTotalSeconds % 60;
//         user.minutes = `${finalMinutes}:${finalSeconds.toString().padStart(2, '0')}`;

//         await user.save();
//         res.status(200).json({ success: true, minutes: user.minutes });
//     } catch (err) {
//         res.status(500).json({ success: false, msg: "Server Error" });
//     }
// });

// // Update Minutes API
// router.put('/update-minutes', async (req, res) => {
//     const { phone, remainingMinutes } = req.body;
//     try {
//         const user = await User.findOneAndUpdate(
//             { phoneNumber: phone },
//             { $set: { minutes: remainingMinutes } },
//             { returnDocument: 'after' }
//         );

//         if (!user) {
//             return res.status(404).json({ success: false, msg: "User not found" });
//         }

//         res.status(200).json({ success: true, minutes: user.minutes });
//     } catch (err) {
//         console.error("Update Minutes Error:", err);
//         res.status(500).json({ success: false, msg: "Server Error" });
//     }
// });

// // Check Device API
// router.post('/check-device', async (req, res) => {
//     const { phone, deviceId } = req.body;
//     try {
//         const user = await User.findOne({ phoneNumber: phone });

//         if (!user) {
//             return res.status(404).json({ success: false, msg: "User not found" });
//         }

//         if (user.deviceId && user.deviceId !== deviceId) {
//             return res.json({ action: 'BLOCK', msg: 'Device mismatch' });
//         }

//         if (!user.deviceId) {
//             user.deviceId = deviceId;
//             await user.save();
//         }

//         res.json({ action: 'ALLOW' });
//     } catch (err) {
//         console.error("Check Device Error:", err);
//         res.status(500).json({ success: false, msg: "Server Error" });
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');

router.get('/get-current-rate/:currency', userController.getCurrentRate);
router.get('/payment-methods/:country', userController.getPaymentMethods);
router.get('/current-user', userController.getCurrentUser);
router.get('/user-minutes', userController.getUserMinutes);
router.put('/add-minutes', userController.addMinutes);
router.put('/update-minutes', userController.updateMinutes);
router.post('/check-device', userController.checkDevice);

module.exports = router;