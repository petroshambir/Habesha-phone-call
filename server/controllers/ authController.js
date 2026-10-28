const User = require('../Models/User.js');
const axios = require('axios');
const { parsePhoneNumberFromString } = require('libphonenumber-js');

exports.login = async (req, res) => {
    const { phone, deviceId } = req.body;
    try {
        if (!phone || !deviceId) {
            return res.status(400).json({ success: false, msg: 'Phone and device ID are required.' });
        }
        const user = await User.findOne({ phoneNumber: phone });
        if (!user) return res.status(404).json({ success: false, msg: 'እዚ ቁጽሪ እዚ ኣይተመዝገበን!' });

        if (!user.deviceId) {
            user.deviceId = deviceId;
            await user.save();
            return res.status(200).json({ success: true, user });
        }
        if (user.deviceId !== deviceId) {
            return res.status(403).json({ success: false, msg: 'እዚ ኣካውንት ኣብ ካልእ ስልኪ ተመዝጊቡ ስለዘሎ፡ ካብዚ ስልኪ ክትጥቀሙ ኣይትኽእሉን።' });
        }
        return res.status(200).json({ success: true, user });
    } catch (err) {
        console.error('Login Error:', err);
        return res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

exports.register = async (req, res) => {
    const { email, phone, currency } = req.body;
    if (!email || !phone) return res.status(400).json({ success: false, msg: 'Email and phone are required.' });
    try {
        const existingUser = await User.findOne({ $or: [{ email: email.trim().toLowerCase() }, { phoneNumber: phone }] });
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
        console.log(`OTP generated for ${email}:`, otpCode);

        try {
            await axios.post('https://api.brevo.com/v3/smtp/email', {
                sender: { name: 'Habesha Tele', email: process.env.EMAIL_SENDER || 'petroshambirr@gmail.com' },
                to: [{ email: email.trim().toLowerCase() }],
                subject: 'Habesha Tele Code',
                textContent: `ናትካ ናይ መረጋገጺ ኮድ ${otpCode} እዩ።`
            }, {
                headers: {
                    accept: 'application/json',
                    'api-key': process.env.BREVO_API_KEY || process.env.EMAIL_PASS,
                    'content-type': 'application/json'
                }
            });
        } catch (mailErr) {
            console.error('Email error:', mailErr.response?.data || mailErr.message);
            return res.status(502).json({ success: false, msg: 'Verification email could not be sent. Please try again.' });
        }

        // NOTE: OTP is still returned to the client to match the current frontend flow.
        // For production, store a hashed OTP server-side and do not return it here.
        return res.status(200).json({
            success: true,
            otp: otpCode,
            isExistingUser: !!existingUser,
            userData: { email: email.trim().toLowerCase(), phone, currency: currency || 'USD' }
        });
    } catch (err) {
        console.error('Register Error:', err);
        return res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, phone, userOtp, actualOtp, isExistingUser, currency } = req.body;
    if (!email || !phone || userOtp == null || actualOtp == null) {
        return res.status(400).json({ success: false, msg: 'Verification information is missing.' });
    }
    try {
        if (String(userOtp) !== String(actualOtp)) {
            return res.status(400).json({ success: false, msg: 'ዝኣተወ ኮድ ጌጋ እዩ።' });
        }

        let user;
        if (isExistingUser) {
            user = await User.findOne({ phoneNumber: phone });
            if (!user) return res.status(404).json({ success: false, msg: 'Existing user was not found.' });
        } else {
            const parsedPhone = parsePhoneNumberFromString(phone);
            const detectedCountry = parsedPhone?.country || 'Unknown';
            user = new User({ email: email.trim().toLowerCase(), phoneNumber: phone, minutes: '00:00', currency: currency || 'USD', country: detectedCountry });
            await user.save();
        }
        return res.status(200).json({ success: true, user });
    } catch (err) {
        console.error('Verify OTP Error:', err);
        return res.status(500).json({ success: false, msg: 'Server Error' });
    }
};