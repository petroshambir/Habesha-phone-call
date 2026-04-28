

const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const nodemailer = require('nodemailer');
const axios = require('axios');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: { rejectUnauthorized: false }
});

// --- 1. Login ---
router.post('/login', async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await User.findOne({ phoneNumber: phone });
        if (!user) return res.status(404).json({ success: false, msg: "እዚ ቁጽሪ እዚ ኣይተመዝገበን!" });
        res.status(200).json({ success: true, user });
    } catch (err) { res.status(500).json({ success: false }); }
});

// --- 2. Register ---
router.post('/register', async (req, res) => {
    const { email, phone, currency } = req.body; 
    try {
        let userExists = await User.findOne({ $or: [{ email }, { phoneNumber: phone }] });
        const isExistingUser = !!userExists; 
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString(); 
        
        console.log(`🔥 OTP for ${email}:`, otpCode);
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Habesha Tele Code',
                text: `ናትካ ናይ መረጋገጺ ኮድ ${otpCode} እዩ።`
            });
        } catch (mailErr) { console.log("Email error..."); }

        res.status(200).json({ 
            success: true, 
            otp: otpCode, 
            isExistingUser, 
            userData: { email, phone, currency: currency || 'USD' } 
        });
    } catch (err) { res.status(500).json({ success: false }); }
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
                // ሕጂ እቲ Currency ካብ Frontend ዝመጸ (UGX, ETB...) ኣብ DB ይስፈር ኣሎ
                user = new User({ 
                    email, 
                    phoneNumber: phone, 
                    minutes: "10:00", 
                    currency: currency || 'USD' 
                });
                await user.save();
            }
            res.status(200).json({ success: true, user });
        } else {
            res.status(400).json({ success: false, msg: "ዝኣተወ ኮድ ጌጋ እዩ።" });
        }
    } catch (err) { res.status(500).json({ success: false }); }
});

// --- 4. Current User Info ---
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
        res.status(200).json({ success: true, phone: user.phoneNumber, currency: user.currency || 'USD' });
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

module.exports = router;