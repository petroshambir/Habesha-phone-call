

// const express = require('express');
// const router = express.Router();
// const User = require('../Models/User.js'); 
// const nodemailer = require('nodemailer');
// const axios = require('axios');
// const { parsePhoneNumberFromString } = require('libphonenumber-js');
// const PaymentMethod = require('../Models/PaymentMethod.js');
// const Settings = require('../Models/Settings.js');
// const twilio = require('twilio');
// const VoiceResponse = require('twilio').twiml.VoiceResponse;


// // Environment Variables
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER || '+17374231506';

// // ሓደ ግዜ ጥራይ ንጅምር
// const client = twilio(accountSid, authToken);


// // Twilio Make Call API
// router.post('/call/make-call', async (req, res) => {
//     const { fromNumber, toNumber } = req.body;
//     try {
//         const user = await User.findOne({ phoneNumber: fromNumber });
//         // ተጠቃሚ እንተዘየለ ወይ ደቂቕ እንተዘይብሉ
//         if (!user || user.minutes === "00:00" || user.minutes.startsWith('-')) {
//             return res.status(400).json({ success: false, msg: "እኹል ደቂቕ የብልካን በጃካ ካርድ ዓድግ!" });
//         }

//         console.log("☎️ Twilio is dialing from:", twilioFromNumber, "to:", toNumber);

//         // const call = await client.calls.create({
//         //     url: 'https://habesha-phone-call-4.onrender.com/api/auth/voice', 
//         //     to: toNumber, 
//         //     from: twilioFromNumber,
//         //     statusCallback: 'https://habesha-phone-call-4.onrender.com/api/auth/call-status',
//         //     statusCallbackEvent: ['answered', 'completed'],
//         //     statusCallbackMethod: 'POST'
//         // });
//         const call = await client.calls.create({
//     url: 'https://habesha-phone-call-4.onrender.com/api/auth/voice', 
//     to: toNumber, 
//     from: twilioFromNumber,
//     timeout: 30, // 30 ሰከንድ ሪንግ ክትገብር ከለኻ ተቀባሊ ዘይተለዓለ እንተኾይኑ ይዓጽዎ
//     statusCallback: 'https://habesha-phone-call-4.onrender.com/api/auth/call-status',
//     statusCallbackEvent: ['completed'], // 'answered' ኣውጺእናዮ
//     statusCallbackMethod: 'POST'
// });
//         res.json({ success: true, callSid: call.sid });
//     } catch (error) {
//         console.error("❌ Twilio Call Error:", error);
//         res.status(500).json({ success: false, msg: "ምድዋል ኣይተኻእለን፣ በጃካ ደጊምካ ፈትን" });
//     }
// }); 

// // 🎯 እዚ Endpoint እዚ ኣብ ግብሪ ክውዕል ኣለዎ (Status Callback)
// router.post('/call-status', (req, res) => {
//     const { CallStatus, CallSid } = req.body;
//     console.log(`📞 Call SID: ${CallSid} | Current Status: ${CallStatus}`);
    
//     // ኣብዚ እቲ ስልኪ "answered" ምስ ኮነ፡ ኣብ Database ንተጠቃሚ ክተፍልጦ ወይ ክትመዝግቦ ትኽእል
//     res.sendStatus(200); 
// });


// // 1. Admin ዋጋ ዝቕይረሉ API
// router.post('/admin/update-rate', async (req, res) => {
//     const { currency, useManualRate, manualRate } = req.body;
//     try {
//         let finalRate = manualRate && manualRate !== "" ? Number(manualRate) : 0;
        
//         if (isNaN(finalRate)) {
//             finalRate = 0;
//         }

//         let settings = await Settings.findOneAndUpdate(
//             { currency: currency },
//             { 
//                 $set: { 
//                     useManualRate: useManualRate, 
//                     manualRate: finalRate 
//                 } 
//             },
//             { upsert: true, returnDocument: 'after' } 
//         );
//         res.json({ success: true, settings });
//     } catch (err) { 
//         console.error("❌ Update Rate Error:", err);
//         res.status(500).json({ success: false, msg: "Server Error" }); 
//     }
// });

// // 2. ናይ ሕጂ ዋጋ መውጽኢ API
// router.get('/get-current-rate/:currency', async (req, res) => {
//     const { currency } = req.params;
//     try {
//         const settings = await Settings.findOne({ currency: currency });

//         if (settings && settings.useManualRate) {
//             return res.json({ success: true, settings });
//         }

//         try {
//             const apiRes = await axios.get(`https://open.er-api.com/v6/latest/USD`);
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

// // 3. Payment Methods API
// router.get('/payment-methods/:country', async (req, res) => {
//     let { country } = req.params;
//     try {
//         const initialMethods = {
//             "ET": [
//                 { name: "Telebirr", icon: "📱", color: "bg-blue-600", account: "0993501570" },
//                 { name: "CBE Bank", icon: "🏦", color: "bg-purple-700", account: "1000..." },
//                 { name: "Abyssinia Bank", icon: "🏛️", color: "bg-yellow-600", account: "8877..." }
//             ],
//             "UG": [
//                 { name: "MTN MoMo", icon: "🟡", color: "bg-yellow-500 text-black", account: "0707415421" },
//                 { name: "Airtel Money", icon: "🔴", color: "bg-red-600", account: "0707415421" }
//             ],
//             "AO": [
//                 { name: "Unitel Money", icon: "📱", color: "bg-orange-500 text-white", account: "00244..." },
//                 { name: "BAI Bank", icon: "🏦", color: "bg-blue-800 text-white", account: "AO06..." }
//             ],
//             "SS": [
//                 { name: "m-GURUSH", icon: "💰", color: "bg-green-600 text-white", account: "092..." },
//                 { name: "Nile Bank", icon: "🏛️", color: "bg-gray-800 text-white", account: "100..." }
//             ],
//             "KE": [
//                 { name: "M-Pesa", icon: "🟢", color: "bg-green-500 text-white", account: "07..." },
//                 { name: "Equity Bank", icon: "🏦", color: "bg-red-700 text-white", account: "254..." }
//             ],
//             "DEFAULT": [
//                 { name: "Visa / Card", icon: "💳", color: "bg-gray-700 text-white", account: "Online Checkout" }
//             ]
//         };

//         const methods = initialMethods[country] || initialMethods["DEFAULT"];
//         res.json({ success: true, methods });
//     } catch (err) {
//         res.status(500).json({ success: false, msg: "Server Error" });
//     }
// });

// // 4. SMTP Config (Nodemailer)
// const transporter = nodemailer.createTransport({
//     host: 'smtp-relay.brevo.com',
//     port: 465,         
//     secure: true,      
//     auth: {
//         user: process.env.EMAIL_USER || 'petroshambirr@gmail.com', 
//         pass: process.env.EMAIL_PASS || 'ffymjvbttiokibbd'  
//     },
//     tls: { 
//         rejectUnauthorized: false 
//     }
// });

// // 5. Login API
// router.post('/login', async (req, res) => {
//     const { phone, deviceId } = req.body; 
//     try {
//         const user = await User.findOne({ phoneNumber: phone });
        
//         if (!user) {
//             return res.status(404).json({ success: false, msg: "እዚ ቁጽሪ እዚ ኣይተመዝገበን!" });
//         }

//         if (!user.deviceId) {
//             user.deviceId = deviceId; 
//             await user.save();
//             return res.status(200).json({ success: true, user });
//         }

//         if (user.deviceId !== deviceId) {
//             return res.status(403).json({ 
//                 success: false, 
//                 msg: "እዚ ኣካውንት ኣብ ካልእ ስልኪ ተመዝጊቡ ስለዘሎ፡ ካብዚ ስልኪ ክትጥቀሙ ኣይትኽእሉን।" 
//             });
//         }

//         res.status(200).json({ success: true, user });
//     } catch (err) { 
//         console.error("Login Error:", err);
//         res.status(500).json({ success: false, msg: "Server Error" }); 
//     }
// });

// // 6. Register API
// router.post('/register', async (req, res) => {
//     const { email, phone, currency } = req.body; 
//     try {
//         let userExists = await User.findOne({ $or: [{ email }, { phoneNumber: phone }] });
//         const isExistingUser = !!userExists; 
//         const otpCode = Math.floor(1000 + Math.random() * 9000).toString(); 
        
//         console.log(`🔥 OTP for ${email}:`, otpCode);
        
//         try {
//             await axios.post('https://api.brevo.com/v3/smtp/email', {
//                 sender: { name: "Habesha Tele", email: "petroshambirr@gmail.com" },
//                 to: [{ email: email }],
//                 subject: "Habesha Tele Code",
//                 textContent: `ናትካ ናይ መረጋገጺ ኮድ ${otpCode} እዩ።`
//             }, {
//                 headers: {
//                     'accept': 'application/json',
//                     'api-key': process.env.EMAIL_PASS || 'ffymjvbttiokibbd', 
//                     'content-type': 'application/json'
//                 }
//             });
//             console.log("📨 Email sent successfully through Brevo API!");
//         } catch (mailErr) { 
//             console.error("Email error...", mailErr.response ? mailErr.response.data : mailErr.message); 
//         }

//         res.status(200).json({ 
//             success: true, 
//             otp: otpCode, 
//             isExistingUser, 
//             userData: { email, phone, currency: currency || 'USD' } 
//         });
//     } catch (err) { 
//         res.status(500).json({ success: false, msg: "Server Error" }); 
//     }
// });

// // 7. Admin Login API
// router.post('/login-admin', async (req, res) => {
//     const { email, password } = req.body;

//     if (email === (process.env.ADMIN_EMAIL || "admin@habeshatele.com") && password === (process.env.ADMIN_PASS || "Admin@1234")) {
//         return res.status(200).json({ 
//             success: true, 
//             isAdmin: true, 
//             msg: "Welcome Admin!" 
//         });
//     } else {
//         return res.status(401).json({ success: false, msg: "ኢመይል ወይ ፓስዎርድ ጌጋ እዩ" });
//     }
// });

// // 8. Verify OTP API
// router.post('/verify-otp', async (req, res) => {
//     const { email, phone, userOtp, actualOtp, isExistingUser, currency } = req.body;
//     try {
//         if (String(userOtp) === String(actualOtp)) {
//             let user;
//             if (isExistingUser) {
//                 user = await User.findOne({ phoneNumber: phone });
//             } else {
//                 const phoneNumber = parsePhoneNumberFromString(phone);
//                 const detectedCountry = phoneNumber && phoneNumber.country ? phoneNumber.country : "Unknown";

//                 user = new User({ 
//                     email, 
//                     phoneNumber: phone, 
//                     minutes: "00:00", 
//                     currency: currency || 'USD',
//                     country: detectedCountry 
//                 });
//                 await user.save();
//             }
//             res.status(200).json({ success: true, user });
//         } else {
//             res.status(400).json({ success: false, msg: "ዝኣተወ ኮድ ጌጋ እዩ።" });
//         }
//     } catch (err) { 
//         console.error("Verify OTP Error:", err);
//         res.status(500).json({ success: false, msg: "Server Error" }); 
//     }
// });

// // 9. Current User API
// router.get('/current-user', async (req, res) => {
//     const phone = req.query.phone; 
//     try {
//         let user;
//         if (phone) {
//             user = await User.findOne({ phoneNumber: phone });
//         } else {
//             user = await User.findOne().sort({ createdAt: -1 });
//         }

//         if (!user) return res.status(404).json({ success: false, msg: "User not found" });

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

// // 10. User Minutes API
// router.get('/user-minutes', async (req, res) => {
//     const { phone } = req.query;
//     try {
//         const user = await User.findOne({ phoneNumber: phone }); 
//         if (!user) return res.status(404).json({ success: false, msg: "User not found" });
//         res.status(200).json({ success: true, minutes: user.minutes, currency: user.currency });
//     } catch (err) { 
//         res.status(500).json({ success: false, msg: "Server Error" }); 
//     }
// });

// // 11. Add Minutes API
// router.put('/add-minutes', async (req, res) => {
//     const { phone, minutesToAdd } = req.body;
//     try {
//         const user = await User.findOne({ phoneNumber: phone });
//         if (!user) return res.status(404).json({ success: false, msg: "User not found" });

//         const [m, s] = user.minutes.split(':').map(Number);
//         let currentTotalSeconds = (m * 60) + (s || 0);
//         let finalTotalSeconds = currentTotalSeconds + (Number(minutesToAdd) * 60);

//         const finalMinutes = Math.floor(finalTotalSeconds / 60);
//         const finalSeconds = finalTotalSeconds % 60;
//         user.minutes = `${finalMinutes}:${finalSeconds.toString().padStart(2, '0')}`;

//         await user.save();
//         res.status(200).json({ success: true, minutes: user.minutes });
//     } catch (err) { 
//         res.status(500).json({ success: false, msg: "Server Error" }); 
//     }
// });

// // 12. Update Minutes API
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

// // 13. Check Device API
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

// // router.post('/voice', (req, res) => {
// //     const toNumber = req.body.To; 
// //     const myTwilioNumber = process.env.TWILIO_PHONE_NUMBER || '+17374231506';

// //     const twiml = `<?xml version="1.0" encoding="UTF-8"?>
// //     <Response>
// //         <Dial callerId="${myTwilioNumber}" 
// //               timeout="30" 
// //               answerOnBridge="true" 
// //               record="record-from-answer">
// //               ${toNumber}
// //         </Dial>
// //     </Response>`;
    
// //     res.type('text/xml');
// //     res.send(twiml);
// // });

// // 🛑 15. Twilio Hangup Call API 
// router.post('/call/hangup-call', async (req, res) => { // 🎯 ካብ /hangup-call ናብ /call/hangup-call ቀይራ!
//     const { callSid } = req.body;
//     if (!callSid) {
//         return res.status(400).json({ success: false, msg: "No callSid provided" });
//     }
//     try {
//         await client.calls(callSid).update({ status: 'completed' });
//         res.json({ success: true, msg: "Call hung up from Twilio side successfully" });
//     } catch (error) {
//         console.error("❌ Twilio Hangup Error:", error);
//         res.status(500).json({ success: false, msg: "Failed to terminate call from server" });
//     }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../Models/User.js');
const axios = require('axios');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const PaymentMethod = require('../Models/PaymentMethod.js');
const Settings = require('../Models/Settings.js');
const twilio = require('twilio');
const VoiceResponse = require('twilio').twiml.VoiceResponse;

// Environment Variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER || '+17374231506';

const client = twilio(accountSid, authToken);

// Twilio Make Call API
router.post('/call/make-call', async (req, res) => {
    const { fromNumber, toNumber } = req.body;

    try {
        const user = await User.findOne({ phoneNumber: fromNumber });

        if (
            !user ||
            user.minutes === '00:00' ||
            user.minutes.startsWith('-')
        ) {
            return res.status(400).json({
                success: false,
                msg: 'እኹል ደቂቕ የብልካን በጃካ ካርድ ዓድግ!'
            });
        }

        const call = await client.calls.create({
            url: 'https://habesha-phone-call-4.onrender.com/api/auth/voice',
            to: toNumber,
            from: twilioFromNumber,
            timeout: 30,
            statusCallback: 'https://habesha-phone-call-4.onrender.com/api/auth/call-status',
            statusCallbackEvent: ['completed'],
            statusCallbackMethod: 'POST'
        });

        res.json({
            success: true,
            callSid: call.sid
        });
    } catch (error) {
        console.error('Twilio Call Error:', error);

        res.status(500).json({
            success: false,
            msg: 'ምድዋል ኣይተኻእለን፣ በጃካ ደጊምካ ፈትን'
        });
    }
});

// Twilio Call Status
router.post('/call-status', (req, res) => {
    const { CallStatus, CallSid } = req.body;

    console.log(`Call SID: ${CallSid} | Current Status: ${CallStatus}`);

    res.sendStatus(200);
});

// 1. Admin Update Rate API
router.post('/admin/update-rate', async (req, res) => {
    const { currency, useManualRate, manualRate } = req.body;

    try {
        let finalRate =
            manualRate !== undefined && manualRate !== ''
                ? Number(manualRate)
                : 0;

        if (!Number.isFinite(finalRate)) {
            finalRate = 0;
        }

        const settings = await Settings.findOneAndUpdate(
            { currency },
            {
                $set: {
                    useManualRate,
                    manualRate: finalRate
                }
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        );

        res.json({
            success: true,
            settings
        });
    } catch (err) {
        console.error('Update Rate Error:', err);

        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

// 2. Get Current Rate API
router.get('/get-current-rate/:currency', async (req, res) => {
    const currency = String(req.params.currency || '').toUpperCase();

    try {
        const settings = await Settings.findOne({ currency });

        if (settings && settings.useManualRate) {
            return res.json({
                success: true,
                settings
            });
        }

        try {
            const apiRes = await axios.get(
                'https://open.er-api.com/v6/latest/USD',
                { timeout: 10000 }
            );

            const liveRates = apiRes.data.rates || {};
            const liveRateForCurrency = liveRates[currency];

            if (!Number.isFinite(liveRateForCurrency)) {
                return res.status(400).json({
                    success: false,
                    msg: 'Currency rate not available'
                });
            }

            return res.json({
                success: true,
                settings: {
                    currency,
                    useManualRate: false,
                    manualRate: liveRateForCurrency
                }
            });
        } catch (apiErr) {
            console.error('Exchange Rate Fetch Error:', apiErr.message);

            return res.json({
                success: true,
                settings: settings || {
                    currency,
                    useManualRate: false,
                    manualRate: 1
                }
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

// 3. Payment Methods API
router.get('/payment-methods/:country', async (req, res) => {
    const country = String(req.params.country || '').toUpperCase();

    try {
        const initialMethods = {
            ET: [
                {
                    name: 'Telebirr',
                    icon: '📱',
                    color: 'bg-blue-600',
                    account: '0993501570'
                },
                {
                    name: 'CBE Bank',
                    icon: '🏦',
                    color: 'bg-purple-700',
                    account: '1000...'
                },
                {
                    name: 'Abyssinia Bank',
                    icon: '🏛️',
                    color: 'bg-yellow-600',
                    account: '8877...'
                }
            ],
            UG: [
                {
                    name: 'MTN MoMo',
                    icon: '🟡',
                    color: 'bg-yellow-500 text-black',
                    account: '0707415421'
                },
                {
                    name: 'Airtel Money',
                    icon: '🔴',
                    color: 'bg-red-600',
                    account: '0707415421'
                }
            ],
            AO: [
                {
                    name: 'Unitel Money',
                    icon: '📱',
                    color: 'bg-orange-500 text-white',
                    account: '00244...'
                },
                {
                    name: 'BAI Bank',
                    icon: '🏦',
                    color: 'bg-blue-800 text-white',
                    account: 'AO06...'
                }
            ],
            SS: [
                {
                    name: 'm-GURUSH',
                    icon: '💰',
                    color: 'bg-green-600 text-white',
                    account: '092...'
                },
                {
                    name: 'Nile Bank',
                    icon: '🏛️',
                    color: 'bg-gray-800 text-white',
                    account: '100...'
                }
            ],
            KE: [
                {
                    name: 'M-Pesa',
                    icon: '🟢',
                    color: 'bg-green-500 text-white',
                    account: '07...'
                },
                {
                    name: 'Equity Bank',
                    icon: '🏦',
                    color: 'bg-red-700 text-white',
                    account: '254...'
                }
            ],
            DEFAULT: [
                {
                    name: 'Visa / Card',
                    icon: '💳',
                    color: 'bg-gray-700 text-white',
                    account: 'Online Checkout'
                }
            ]
        };

        const methods =
            initialMethods[country] || initialMethods.DEFAULT;

        res.json({
            success: true,
            methods
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

// 4. Login API
router.post('/login', async (req, res) => {
    const { phone, deviceId } = req.body;

    try {
        const user = await User.findOne({ phoneNumber: phone });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'እዚ ቁጽሪ እዚ ኣይተመዝገበን!'
            });
        }

        if (!user.deviceId) {
            user.deviceId = deviceId;
            await user.save();

            return res.status(200).json({
                success: true,
                user
            });
        }

        if (user.deviceId !== deviceId) {
            return res.status(403).json({
                success: false,
                msg: 'እዚ ኣካውንት ኣብ ካልእ ስልኪ ተመዝጊቡ ስለዘሎ፡ ካብዚ ስልኪ ክትጥቀሙ ኣይትኽእሉን።'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        console.error('Login Error:', err);

        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

// 5. Register API — Generate OTP and send email
router.post('/register', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const phoneInput = String(req.body.phone || '').trim();
    const currencyInput = String(req.body.currency || 'USD')
        .trim()
        .toUpperCase();

    const currency = /^[A-Z]{3}$/.test(currencyInput)
        ? currencyInput
        : 'USD';

    try {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                msg: 'በጃኻ ትኽክለኛ ኢመይል ኣእቱ።'
            });
        }

        const parsedPhone = parsePhoneNumberFromString(phoneInput);

        if (!parsedPhone || !parsedPhone.isValid()) {
            return res.status(400).json({
                success: false,
                msg: 'በጃኻ ትኽክለኛ ናይ ዓለምለኻዊ ቁጽሪ ተሌፎን ኣእቱ።'
            });
        }

        const phone = parsedPhone.number;

        const existingByEmail = await User.findOne({ email });
        const existingByPhone = await User.findOne({
            phoneNumber: phone
        });

        if (
            (existingByEmail || existingByPhone) &&
            (
                !existingByEmail ||
                !existingByPhone ||
                String(existingByEmail._id) !== String(existingByPhone._id)
            )
        ) {
            return res.status(409).json({
                success: false,
                msg: 'እዚ ኢመይል ወይ ቁጽሪ ተሌፎን ኣቐዲሙ ብካልእ ኣካውንት ተመዝጊቡ ኣሎ።'
            });
        }

        const brevoApiKey = process.env.BREVO_API_KEY;
        const senderEmail = process.env.EMAIL_FROM;

        if (!brevoApiKey || !senderEmail) {
            console.error(
                'Register Error: BREVO_API_KEY or EMAIL_FROM is missing.'
            );

            return res.status(500).json({
                success: false,
                msg: 'ናይ ኢመይል ስርዓት ገና ኣይተዳለወን።'
            });
        }

        if (!mongoose.connection.db) {
            return res.status(503).json({
                success: false,
                msg: 'Database ገና ኣይተራኸበን። በጃኻ ደጊምካ ፈትን።'
            });
        }

        const otpCode = crypto.randomInt(1000, 10000).toString();

        const otpHash = crypto
            .createHash('sha256')
            .update(otpCode)
            .digest('hex');

        const otpCollection =
            mongoose.connection.db.collection('pendingotps');

        await otpCollection.createIndex(
            { expiresAt: 1 },
            { expireAfterSeconds: 0 }
        );

        // Remove any previous OTP for this email or phone.
        await otpCollection.deleteMany({
            $or: [
                { email },
                { phone }
            ]
        });

        // Save the OTP before sending the email.
        await otpCollection.insertOne({
            email,
            phone,
            currency,
            otpHash,
            attempts: 0,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            createdAt: new Date()
        });

        try {
            await axios.post(
                'https://api.brevo.com/v3/smtp/email',
                {
                    sender: {
                        name: 'Habesha Tele',
                        email: senderEmail
                    },
                    to: [{ email }],
                    subject: 'Habesha Tele Verification Code',
                    textContent:
                        `ናይ Habesha Tele መረጋገጺ ኮድካ ${otpCode} እዩ። ` +
                        'እዚ ኮድ ኣብ 10 ደቒቕ ይውዳእ።'
                },
                {
                    headers: {
                        accept: 'application/json',
                        'api-key': brevoApiKey,
                        'content-type': 'application/json'
                    },
                    timeout: 15000
                }
            );
        } catch (mailErr) {
            // If email sending fails, remove the OTP that was just saved.
            await otpCollection.deleteMany({
                email,
                phone
            });

            console.error(
                'Brevo Email Error:',
                mailErr.response?.data || mailErr.message
            );

            return res.status(502).json({
                success: false,
                msg: 'ናይ መረጋገጺ ኮድ ናብ ኢመይል ምልኣኽ ኣይተኻእለን። በጃኻ ደጊምካ ፈትን።'
            });
        }

        return res.status(200).json({
            success: true,
            msg: 'Verification code sent successfully.'
        });
    } catch (err) {
        console.error('Register Error:', err);

        return res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

// 6. Admin Login API
router.post('/login-admin', async (req, res) => {
    const { email, password } = req.body;

    if (
        email === process.env.ADMIN_EMAIL &&
        password === process.env.ADMIN_PASS &&
        process.env.ADMIN_EMAIL &&
        process.env.ADMIN_PASS
    ) {
        return res.status(200).json({
            success: true,
            isAdmin: true,
            msg: 'Welcome Admin!'
        });
    }

    return res.status(401).json({
        success: false,
        msg: 'ኢመይል ወይ ፓስዎርድ ጌጋ እዩ'
    });
});

// 7. Verify OTP API
router.post('/verify-otp', async (req, res) => {
    const email = String(req.body.email || '').trim().toLowerCase();
    const phoneInput = String(req.body.phone || '').trim();
    const userOtp = String(req.body.userOtp || '').trim();
    const currencyInput = String(req.body.currency || 'USD')
        .trim()
        .toUpperCase();

    const currency = /^[A-Z]{3}$/.test(currencyInput)
        ? currencyInput
        : 'USD';

    try {
        if (
            !email ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            !/^\d{4}$/.test(userOtp)
        ) {
            return res.status(400).json({
                success: false,
                msg: 'በጃኻ ትኽክለኛ ኢመይልን 4-ዲጂት ኮድን ኣእቱ።'
            });
        }

        const parsedPhone = parsePhoneNumberFromString(phoneInput);

        if (!parsedPhone || !parsedPhone.isValid()) {
            return res.status(400).json({
                success: false,
                msg: 'ቁጽሪ ተሌፎን ትኽክል ኣይኮነን።'
            });
        }

        const phone = parsedPhone.number;

        if (!mongoose.connection.db) {
            return res.status(503).json({
                success: false,
                msg: 'Database ገና ኣይተራኸበን።'
            });
        }

        const otpCollection =
            mongoose.connection.db.collection('pendingotps');

        const pendingOtp = await otpCollection.findOne({
            email,
            phone
        });

        if (!pendingOtp) {
            return res.status(400).json({
                success: false,
                msg: 'ኮድ የለን ወይ ግዜኡ ወዲኡ። ሓድሽ ኮድ ሕተት።'
            });
        }

        if (pendingOtp.expiresAt <= new Date()) {
            await otpCollection.deleteOne({
                _id: pendingOtp._id
            });

            return res.status(400).json({
                success: false,
                msg: 'እቲ ኮድ ግዜኡ ወዲኡ። ሓድሽ ኮድ ሕተት።'
            });
        }

        if (pendingOtp.attempts >= 5) {
            await otpCollection.deleteOne({
                _id: pendingOtp._id
            });

            return res.status(429).json({
                success: false,
                msg: 'ብዙሕ ግዜ ተፈቲኑ ኣሎ። ሓድሽ ኮድ ሕተት።'
            });
        }

        const suppliedHash = crypto
            .createHash('sha256')
            .update(userOtp)
            .digest('hex');

        if (suppliedHash !== pendingOtp.otpHash) {
            const nextAttempts = pendingOtp.attempts + 1;

            await otpCollection.updateOne(
                { _id: pendingOtp._id },
                { $set: { attempts: nextAttempts } }
            );

            if (nextAttempts >= 5) {
                await otpCollection.deleteOne({
                    _id: pendingOtp._id
                });
            }

            return res.status(400).json({
                success: false,
                msg: 'ዝኣተወ ኮድ ጌጋ እዩ። በጃኻ ደጊምካ ፈትን።'
            });
        }

        let user = await User.findOne({
            email,
            phoneNumber: phone
        });

        if (!user) {
            const existingByEmail = await User.findOne({ email });
            const existingByPhone = await User.findOne({
                phoneNumber: phone
            });

            if (existingByEmail || existingByPhone) {
                await otpCollection.deleteOne({
                    _id: pendingOtp._id
                });

                return res.status(409).json({
                    success: false,
                    msg: 'እዚ ኢመይል ወይ ቁጽሪ ተሌፎን ምስ ካልእ ኣካውንት ተኣሳሲሩ ኣሎ።'
                });
            }

            user = new User({
                email,
                phoneNumber: phone,
                minutes: '00:00',
                currency: pendingOtp.currency || currency,
                country: parsedPhone.country || 'Unknown'
            });

            await user.save();
        }

        await otpCollection.deleteOne({
            _id: pendingOtp._id
        });

        return res.status(200).json({
            success: true,
            msg: 'Email verified successfully.',
            user: {
                email: user.email,
                phoneNumber: user.phoneNumber,
                currency: user.currency,
                country: user.country,
                minutes: user.minutes
            }
        });
    } catch (err) {
        console.error('Verify OTP Error:', err);

        return res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

// 8. Current User API
router.get('/current-user', async (req, res) => {
    const phone = req.query.phone;

    try {
        let user;

        if (phone) {
            user = await User.findOne({
                phoneNumber: phone
            });
        } else {
            user = await User.findOne().sort({
                createdAt: -1
            });
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        let autoCurrency = user.currency || 'USD';

        if (user.country === 'ET') autoCurrency = 'ETB';
        else if (user.country === 'UG') autoCurrency = 'UGX';
        else if (user.country === 'AO') autoCurrency = 'AOA';
        else if (user.country === 'SS') autoCurrency = 'SSP';
        else if (user.country === 'KE') autoCurrency = 'KES';
        else if (user.country === 'SD') autoCurrency = 'SDG';

        res.status(200).json({
            success: true,
            phone: user.phoneNumber,
            currency: autoCurrency
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

// 9. User Minutes API
router.get('/user-minutes', async (req, res) => {
    const { phone } = req.query;

    try {
        const user = await User.findOne({
            phoneNumber: phone
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            minutes: user.minutes,
            currency: user.currency
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

// 10. Add Minutes API
router.put('/add-minutes', async (req, res) => {
    const { phone, minutesToAdd } = req.body;

    try {
        const user = await User.findOne({
            phoneNumber: phone
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        const [m, s] = user.minutes.split(':').map(Number);
        const currentTotalSeconds = (m * 60) + (s || 0);
        const finalTotalSeconds =
            currentTotalSeconds + (Number(minutesToAdd) * 60);

        const finalMinutes = Math.floor(finalTotalSeconds / 60);
        const finalSeconds = finalTotalSeconds % 60;

        user.minutes =
            `${finalMinutes}:${finalSeconds.toString().padStart(2, '0')}`;

        await user.save();

        res.status(200).json({
            success: true,
            minutes: user.minutes
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

// 11. Update Minutes API
router.put('/update-minutes', async (req, res) => {
    const { phone, remainingMinutes } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { phoneNumber: phone },
            { $set: { minutes: remainingMinutes } },
            { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            minutes: user.minutes
        });
    } catch (err) {
        console.error('Update Minutes Error:', err);

        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

// 12. Check Device API
router.post('/check-device', async (req, res) => {
    const { phone, deviceId } = req.body;

    try {
        const user = await User.findOne({
            phoneNumber: phone
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                msg: 'User not found'
            });
        }

        if (user.deviceId && user.deviceId !== deviceId) {
            return res.json({
                action: 'BLOCK',
                msg: 'Device mismatch'
            });
        }

        if (!user.deviceId) {
            user.deviceId = deviceId;
            await user.save();
        }

        res.json({
            action: 'ALLOW'
        });
    } catch (err) {
        console.error('Check Device Error:', err);

        res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
});

// Twilio Voice API
// This route remains as it was in your original file.
// The URL used by make-call must return valid TwiML for calls to connect.

// 13. Twilio Hangup Call API
router.post('/call/hangup-call', async (req, res) => {
    const { callSid } = req.body;

    if (!callSid) {
        return res.status(400).json({
            success: false,
            msg: 'No callSid provided'
        });
    }

    try {
        await client.calls(callSid).update({
            status: 'completed'
        });

        res.json({
            success: true,
            msg: 'Call hung up from Twilio side successfully'
        });
    } catch (error) {
        console.error('Twilio Hangup Error:', error);

        res.status(500).json({
            success: false,
            msg: 'Failed to terminate call from server'
        });
    }
});

module.exports = router;

//redeploy this server
