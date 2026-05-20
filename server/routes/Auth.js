

const express = require('express');
const router = express.Router();
const User = require('../Models/User.js'); 
const nodemailer = require('nodemailer');
const axios = require('axios');
const { parsePhoneNumberFromString } = require('libphonenumber-js');
const PaymentMethod = require('../Models/PaymentMethod.js');
const Settings = require('../Models/Settings.js');

// 1. Admin ዋጋ ዝቕይረሉ API

router.post('/admin/update-rate', async (req, res) => {
    const { currency, useManualRate, manualRate } = req.body;
    try {
        // 🔄 ሓዳስ መፍትሒ፦ እቲ ሬት ባዶ እንተኾይኑ NaN ወይ 0 ከይከውን ንከላኸል
        const finalRate = manualRate && manualRate !== "" ? Number(manualRate) : 0;

        let settings = await Settings.findOneAndUpdate(
            { currency: currency },
            { 
                $set: { 
                    useManualRate: useManualRate, 
                    manualRate: finalRate 
                } 
            },
            { upsert: true, returnDocument: 'after' }
        );
        res.json({ success: true, settings });
    } catch (err) { 
        console.error("❌ Update Rate Error:", err);
        res.status(500).json({ success: false }); 
    }
});




router.get('/get-current-rate/:currency', async (req, res) => {
    const { currency } = req.params;
    try {
        const settings = await Settings.findOne({ currency: currency });

        // 1. እታ ሃገር ኣብ DB እንተሃልያ እሞ ንስኻ "MANUAL" Mode ገይርካያ እንተኔርካ -> ነቲ ናትካ ዋጋ ሃብ
        if (settings && settings.useManualRate) {
            return res.json({ success: true, settings });
        }

        // 2. "AUTOMATIC" Mode እንተኾይኑ ወይ ገና ኣብ DB Settings እንተዘይተፈጢሩሉ -> ካብ ኢንተርኔት ሓቀኛ ዋጋ ኣምጽእ
        try {
            // 🌐 ካብ ፍሉጥ ናይ ኢንተርኔት ዋጋ መውጽኢ (ExchangeRate API) ዋጋ ንሓትት
            const apiRes = await axios.get(`https://open.er-api.com/v6/latest/USD`);
            const liveRates = apiRes.data.rates; // ኩሉ ዋጋታት የውጽእ
            
            // እቲ ናይቲ ሃገር ዋጋ ካብ ኢንተርኔት ንረኽቦ (ንኣብነት 1 USD = 135 KES)
            const liveRateForCurrency = liveRates[currency] || 1; 

            return res.json({
                success: true,
                settings: {
                    currency: currency,
                    useManualRate: false,
                    manualRate: liveRateForCurrency // 👈 ካብ ኢንተርኔት ዝመጸ ሓቀኛ ዋጋ
                }
            });
        } catch (apiErr) {
            console.log("❌ Internet Rate Fetch Error, falling back to DB if exists");
            // ኢንተርኔት እንተዘይሰሪሑ ናብቲ ኣብ DB ዘሎ ናይ መወዳእታ ዋጋ ተመለስ
            return res.json({ 
                success: true, 
                settings: settings || { currency: currency, useManualRate: false, manualRate: 1 } 
            });
        }

    } catch (err) { 
        res.status(500).json({ success: false, msg: "Server Error" }); 
    }
});

router.get('/payment-methods/:country', async (req, res) => {
    let { country } = req.params;
    
    try {
        // ሓድሽ ዝተወሰኸ ሃገራት (ISO Codes: AO, SS, KE)
        const initialMethods = {
            "ET": [
                { name: "Telebirr", icon: "📱", color: "bg-blue-600", account: "0993501570" },
                { name: "CBE Bank", icon: "🏦", color: "bg-purple-700", account: "1000..." },
                { name: "Abyssinia Bank", icon: "🏛️", color: "bg-yellow-600", account: "8877..." }
            ],
            "UG": [
                { name: "MTN MoMo", icon: "🟡", color: "bg-yellow-500 text-black", account: "0707415421" },
                { name: "Airtel Money", icon: "🔴", color: "bg-red-600", account: "0707415421" }
            ],
            "AO": [ // ኣንጎላ (Angola)
                { name: "Unitel Money", icon: "📱", color: "bg-orange-500 text-white", account: "00244..." },
                { name: "BAI Bank", icon: "🏦", color: "bg-blue-800 text-white", account: "AO06..." }
            ],
            "SS": [ // ጁባ (South Sudan)
                { name: "m-GURUSH", icon: "💰", color: "bg-green-600 text-white", account: "092..." },
                { name: "Nile Bank", icon: "🏛️", color: "bg-gray-800 text-white", account: "100..." }
            ],
            "KE": [ // ከንያ (Kenya)
                { name: "M-Pesa", icon: "🟢", color: "bg-green-500 text-white", account: "07..." },
                { name: "Equity Bank", icon: "🏦", color: "bg-red-700 text-white", account: "254..." }
            ],
            "DEFAULT": [
                { name: "Visa / Card", icon: "💳", color: "bg-gray-700 text-white", account: "Online Checkout" }
            ]
        };

        // እቲ ዝመጸ country (AO, SS, ET, UG...) ኣብዚ Check ይገብር
        const methods = initialMethods[country] || initialMethods["DEFAULT"];

        res.json({ success: true, methods });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server Error" });
    }
});


// --- ሓድሽ ናይ Brevo SMTP ኣወዳድባ (ፖርት 465 SSL ብትኽክል ዝተስተኻኸለ) ---
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 465,         // 👈 ካብ 587 ናብ 465 ቀይርናዮ ኣለና
    secure: true,      // 👈 ብግዴታ true ይኸውን (ምኽንያቱ 465 ስለ ዝኾነ)
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    },
    tls: { 
        rejectUnauthorized: false 
    }
});


// --- 1. Login (ምስ Device Binding ዝተወሃሃደ) ---
router.post('/login', async (req, res) => {
    const { phone, deviceId } = req.body; // ካብ Frontend deviceId ይቕበል
    try {
        const user = await User.findOne({ phoneNumber: phone });
        
        if (!user) {
            return res.status(404).json({ success: false, msg: "እዚ ቁጽሪ እዚ ኣይተመዝገበን!" });
        }

        // --- DEVICE BINDING LOGIC ---
        
        // ሀ. እቲ ተጠቃሚ ገና deviceId እንተዘይብሉ (ንፈለማ እዋን Login ይገብር ኣሎ ማለት እዩ)
        if (!user.deviceId) {
            user.deviceId = deviceId; // ነቲ ID ንመዝግቦ
            await user.save();
            return res.status(200).json({ success: true, user });
        }

        // ለ. እቲ ካብ Frontend ዝመጸ ID ምስቲ ኣብ Database ዘሎ እንተዘይተመሳሲሉ (ካብ ካልእ ስልኪ ይፍትን ኣሎ)
        if (user.deviceId !== deviceId) {
            return res.status(403).json({ 
                success: false, 
                msg: "እዚ ኣካውንት ኣብ ካልእ ስልኪ ተመዝጊቡ ስለዘሎ፡ ካብዚ ስልኪ ክትጥቀሙ ኣይትኽእሉን።" 
            });
        }

        // ሐ. ኩሉ ትኽክል እንተኾይኑ (እታ ዝለመዳ ስልኪ እንተኾይና) የሕልፎ
        res.status(200).json({ success: true, user });

    } catch (err) { 
        console.error("Login Error:", err);
        res.status(500).json({ success: false, msg: "Server Error" }); 
    }
});



// --- 2. Register (ብናይ Brevo Direct HTTP API ዝተስተኻኸለ - ንRender Timeout ዝሰብር) ---
router.post('/register', async (req, res) => {
    const { email, phone, currency } = req.body; 
    try {
        let userExists = await User.findOne({ $or: [{ email }, { phoneNumber: phone }] });
        const isExistingUser = !!userExists; 
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString(); 
        
        console.log(`🔥 OTP for ${email}:`, otpCode);
        
        // --- ናይ Brevo HTTP API ጻውዒት (Render ፈጺሙ ክዓግቶ ኣይክእልን እዩ) ---
        try {
            await axios.post('https://api.brevo.com/v3/smtp/email', {
                sender: { name: "Habesha Tele", email: "petroshambirr@gmail.com" },
                to: [{ email: email }],
                subject: "Habesha Tele Code",
                textContent: `ናትካ ናይ መረጋገጺ ኮድ ${otpCode} እዩ።`
            }, {
                headers: {
                    'accept': 'application/json',
                    'api-key': process.env.EMAIL_PASS, // ⚠️ ኣብ Render Dashboard እታ EMAIL_PASS ናይ ሓቂ API Key (xkeysib-...) ክትከውን ኣለዋ!
                    'content-type': 'application/json'
                }
            });
            console.log("📨 Email sent successfully through Brevo API!");
        } catch (mailErr) { 
            console.log("Email error...", mailErr.response ? mailErr.response.data : mailErr.message); 
        }

        res.status(200).json({ 
            success: true, 
            otp: otpCode, 
            isExistingUser, 
            userData: { email, phone, currency: currency || 'USD' } 
        });
    } catch (err) { res.status(500).json({ success: false }); }
});

// routes/auth.js ውሽጢ እታ Login route
router.post('/login-admin', async (req, res) => {
    const { email, password } = req.body;

    // ምስ .env ዘሎ ዳታ የነጻጽር
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
        return res.status(200).json({ 
            success: true, 
            isAdmin: true, // እዚኣ እያ እታ መለለዪት
            msg: "Welcome Admin!" 
        });
    } else {
        return res.status(401).json({ success: false, msg: "ኢመይል ወይ ፓስዎርድ ጌጋ እዩ" });
    }
});
// --- 3. Verify OTP (እቲ ቀንዲ መፍትሒ ኣብዚ ኣሎ) ---


router.post('/verify-otp', async (req, res) => {
    const { email, phone, userOtp, actualOtp, isExistingUser, currency } = req.body;
    try {
        if (String(userOtp) === String(actualOtp)) {
            let user;
            if (isExistingUser) {
                user = await User.findOne({ phoneNumber: phone });
            } else {
                // *** ሓዳስ መፍትሒ: ሃገር ባዕሉ የለሊ ***
                const phoneNumber = parsePhoneNumberFromString(phone);
                const detectedCountry = phoneNumber ? phoneNumber.country : "Unknown";

                user = new User({ 
                    email, 
                    phoneNumber: phone, 
                    minutes: "00:00", 
                    currency: currency || 'USD',
                    country: detectedCountry // <--- እታ ሃገር ኣብዚ ትስፈር (ንኣብነት ET, UG, US)
                });
                await user.save();
            }
            res.status(200).json({ success: true, user });
        } else {
            res.status(400).json({ success: false, msg: "ዝኣተወ ኮድ ጌጋ እዩ።" });
        }
    } catch (err) { res.status(500).json({ success: false }); }
});



// --- 4. Current User Info (ዝተስተኻኸለ) ---
router.get('/current-user', async (req, res) => {
    const phone = req.query.phone; 
    try {
        let user;
        if (phone) {
            user = await User.findOne({ phoneNumber: phone });
        } else {
            user = await User.findOne().sort({ createdAt: -1 });
        }

        if (!user) return res.status(404).json({ success: false });

        // ባዕሉ Currency ዝህብ ሎጂክ (Hard-coding ንምርሓቕ)
        let autoCurrency = user.currency || 'USD';
     
        if (user.country === 'ET') autoCurrency = 'ETB';
        else if (user.country === 'UG') autoCurrency = 'UGX';
        else if (user.country === 'AO') autoCurrency = 'AOA'; // ኣንጎላ (Kwanza)
        else if (user.country === 'SS') autoCurrency = 'SSP'; // ጁባ (South Sudanese Pound)
        else if (user.country === 'KE') autoCurrency = 'KES'; // ከንያ
        else if (user.country === 'SD') autoCurrency = 'SDG'; // ሱዳን

        res.status(200).json({ 
            success: true, 
            phone: user.phoneNumber, 
            currency: autoCurrency 
        });
    } catch (err) { res.status(500).json({ success: false }); }
});

// --- 5. User Minutes ---
router.get('/user-minutes', async (req, res) => {
    const { phone } = req.query;
    try {
        const user = await User.findOne({ phoneNumber: phone }); 
        if (!user) return res.status(404).json({ success: false });
        res.status(200).json({ success: true, minutes: user.minutes, currency: user.currency });
    } catch (err) { res.status(500).json({ success: false }); }
});

// --- 6. Add Minutes ---
router.put('/add-minutes', async (req, res) => {
    const { phone, minutesToAdd } = req.body;
    try {
        const user = await User.findOne({ phoneNumber: phone });
        if (!user) return res.status(404).json({ success: false });

        const [m, s] = user.minutes.split(':').map(Number);
        let currentTotalSeconds = (m * 60) + (s || 0);
        let finalTotalSeconds = currentTotalSeconds + (Number(minutesToAdd) * 60);

        const finalMinutes = Math.floor(finalTotalSeconds / 60);
        const finalSeconds = finalTotalSeconds % 60;
        user.minutes = `${finalMinutes}:${finalSeconds.toString().padStart(2, '0')}`;

        await user.save();
        res.status(200).json({ success: true, minutes: user.minutes });
    } catch (err) { res.status(500).json({ success: false }); }
});


// --- 7. Update Minutes (ደቂቕ ክጎድል ከሎ ኣብ Database ዝቕይር) ---
// --- 7. Update Minutes (ደቂቕ ክጎድል ከሎ ኣብ Database ብትኽክል ዝቕይር) ---
router.put('/update-minutes', async (req, res) => {
    const { phone, remainingMinutes } = req.body;
    try {
        // 🔄 እታ ቀንዲ መፍትሒ መስመር፦ ሕጂ እቲ ደቂቕ ብትኽክል ኣብ Database $set (Update) ይኸውን ኣሎ!
        const user = await User.findOneAndUpdate(
            { phoneNumber: phone },
            { $set: { minutes: remainingMinutes } },
            { returnDocument: 'after' }
        );

        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found" });
        }

        res.status(200).json({ success: true, minutes: user.minutes });
    } catch (err) {
        console.error("Update Minutes Error:", err);
        res.status(500).json({ success: false, msg: "Server Error" });
    }
});



router.post('/check-device', async (req, res) => {
  const { phone, deviceId } = req.body;
  const user = await User.findOne({ phoneNumber: phone });

  if (user.deviceId && user.deviceId !== deviceId) {
    // እቲ ID ካብቲ ኣብ Database ዘሎ ዝተፈልየ እንተኾይኑ
    return res.json({ action: 'BLOCK', msg: 'Device mismatch' });
  }

  // መጀመሪያ እንተኾይኑ ድማ ነቲ ID ንመዝግቦ
  if (!user.deviceId) {
    user.deviceId = deviceId;
    await user.save();
  }
  
  res.json({ action: 'ALLOW' });
});

module.exports = router;

