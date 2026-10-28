const express = require('express');
const router = express.Router();
const User = require('../Models/User.js');
const twilio = require('twilio');

// Environment Variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER || '+17374231506';

// Initialize Twilio client
const client = twilio(accountSid, authToken);

// Twilio Make Call API
router.post('/call/make-call', async (req, res) => {
    const { fromNumber, toNumber } = req.body;
    try {
        const user = await User.findOne({ phoneNumber: fromNumber });

        if (!user || user.minutes === "00:00" || user.minutes.startsWith('-')) {
            return res.status(400).json({
                success: false,
                msg: "እኹል ደቂቕ የብልካን በጃካ ካርድ ዓድግ!"
            });
        }

        console.log("☎️ Twilio is dialing from:", twilioFromNumber, "to:", toNumber);

        const call = await client.calls.create({
            url: 'https://habesha-phone-call-4.onrender.com/api/auth/voice',
            to: toNumber,
            from: twilioFromNumber,
            timeout: 30,
            statusCallback: 'https://habesha-phone-call-4.onrender.com/api/auth/call-status',
            statusCallbackEvent: ['completed'],
            statusCallbackMethod: 'POST'
        });

        res.json({ success: true, callSid: call.sid });
    } catch (error) {
        console.error("❌ Twilio Call Error:", error);
        res.status(500).json({
            success: false,
            msg: "ምድዋል ኣይተኻእለን፣ በጃካ ደጊምካ ፈትን"
        });
    }
});

// Twilio Status Callback
router.post('/call-status', (req, res) => {
    const { CallStatus, CallSid } = req.body;
    console.log(`📞 Call SID: ${CallSid} | Current Status: ${CallStatus}`);
    res.sendStatus(200);
});

// Voice route was commented out in the original code.
// router.post('/voice', (req, res) => {
//     const toNumber = req.body.To;
//     const myTwilioNumber = process.env.TWILIO_PHONE_NUMBER || '+17374231506';
//     const twiml = `<?xml version="1.0" encoding="UTF-8"?>
//     <Response>
//         <Dial callerId="${myTwilioNumber}"
//               timeout="30"
//               answerOnBridge="true"
//               record="record-from-answer">
//               ${toNumber}
//         </Dial>
//     </Response>`;
//     res.type('text/xml');
//     res.send(twiml);
// });

// Twilio Hangup Call API
router.post('/call/hangup-call', async (req, res) => {
    const { callSid } = req.body;
    if (!callSid) {
        return res.status(400).json({ success: false, msg: "No callSid provided" });
    }

    try {
        await client.calls(callSid).update({ status: 'completed' });
        res.json({ success: true, msg: "Call hung up from Twilio side successfully" });
    } catch (error) {
        console.error("❌ Twilio Hangup Error:", error);
        res.status(500).json({
            success: false,
            msg: "Failed to terminate call from server"
        });
    }
});

module.exports = router;