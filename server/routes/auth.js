const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     },
//     tls: {
//         rejectUnauthorized: false
//     }
// });
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // 587 ክትጥቀም ከለኻ እዚ 'false' ክኸውን ኣለዎ
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // እዚ ንናይ ISP ዕንቅፋታት ንምሕላፍ ይሕግዝ
    }
});

router.post('/register', async (req, res) => {
    const { email, phone } = req.body;

    try {
        let userExists = await User.findOne({ $or: [{ email }, { phoneNumber: phone }] });
        if (userExists) {
            return res.status(400).json({ success: false, msg: "ኢመይል ወይ ቁጽሪ ስልኪ ድሮ ተመዝጊቡ እዩ!" });
        }

        // 1. ኮድ ንፈጥር
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString(); 

        // 2. *** ኣገዳሲ፦ ነቲ ኮድ ኣብ ተርሚናል ቅድሚ ኩሉ ንጽሕፎ ***
        console.log("===============================");
        console.log("🔥 YOUR OTP CODE IS:", otpCode);
        console.log("===============================");

        // 3. ኢመይል ምስዳድ (እዚ ጸገም እንተፈጢሩ ናብ catch ይኸይድ)
        // እቲ ETIMEDOUT Error ንምውጋድ ነዚ መስመር // ጌርካ ክትዓጽዎ ትኽእል ኢኻ
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Habesha Tele Verification Code',
                text: `ናትካ ናይ መረጋገጺ ኮድ ${otpCode} እዩ።`
            });
        } catch (mailErr) {
            console.log("Email could not be sent, but continuing with Terminal OTP...");
        }

        // 4. መልሲ ናብ Frontend ንሰድድ
        res.status(200).json({ 
            success: true, 
            msg: "ኮድ ተላኢኹ ኣሎ (ተርሚናል ርአ)", 
            otp: otpCode, 
            userData: { email, phone } 
        });

    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ success: false, msg: "Server Error" });
    }
});

// ... (እቲ ዝተረፈ Verify-OTP ን Login ን ከም ዘለዎ ይቐጽል)

router.post('/verify-otp', async (req, res) => {
    const { email, phone, userOtp, actualOtp } = req.body;
    try {
        if (userOtp === actualOtp) {
            const newUser = new User({ email, phoneNumber: phone, minutes: "10:00" });
            await newUser.save();
            res.status(201).json({ success: true, msg: "ምዝገባ ተዓዊቱ!" });
        } else {
            res.status(400).json({ success: false, msg: "ዝኣተወ ኮድ ጌጋ እዩ።" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server Error" });
    }
});

router.post('/login', async (req, res) => {
    const { phone } = req.body;
    try {
        const user = await User.findOne({ phoneNumber: phone });
        if (!user) return res.status(404).json({ success: false, msg: "እዚ ቁጽሪ እዚ ኣይተመዝገበን።" });
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, msg: "Server Error" });
    }
});

module.exports = router;