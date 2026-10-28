const User = require('../Models/User.js');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioFromNumber = process.env.TWILIO_PHONE_NUMBER || '+17374231506';

function getTwilioClient() {
    if (!accountSid || !authToken) throw new Error('Twilio credentials are missing from environment variables.');
    return twilio(accountSid, authToken);
}

exports.makeCall = async (req, res) => {
    const { fromNumber, toNumber } = req.body;
    if (!fromNumber || !toNumber) return res.status(400).json({ success: false, msg: 'fromNumber and toNumber are required.' });
    try {
        const user = await User.findOne({ phoneNumber: fromNumber });
        if (!user || user.minutes === '00:00' || String(user.minutes).startsWith('-')) {
            return res.status(400).json({ success: false, msg: 'እኹል ደቂቕ የብልካን በጃካ ካርድ ዓድግ!' });
        }
        const client = getTwilioClient();
        const call = await client.calls.create({
            url: 'https://habesha-phone-call-4.onrender.com/api/auth/voice',
            to: toNumber,
            from: twilioFromNumber,
            timeout: 30,
            statusCallback: 'https://habesha-phone-call-4.onrender.com/api/auth/call-status',
            statusCallbackEvent: ['completed'],
            statusCallbackMethod: 'POST'
        });
        return res.json({ success: true, callSid: call.sid });
    } catch (err) {
        console.error('Twilio Call Error:', err);
        return res.status(500).json({ success: false, msg: 'ምድዋል ኣይተኻእለን፣ በጃካ ደጊምካ ፈትን' });
    }
};

exports.callStatus = (req, res) => {
    const { CallStatus, CallSid } = req.body;
    console.log(`Call SID: ${CallSid} | Current Status: ${CallStatus}`);
    return res.sendStatus(200);
};

exports.hangupCall = async (req, res) => {
    const { callSid } = req.body;
    if (!callSid) return res.status(400).json({ success: false, msg: 'No callSid provided' });
    try {
        const client = getTwilioClient();
        await client.calls(callSid).update({ status: 'completed' });
        return res.json({ success: true, msg: 'Call hung up from Twilio side successfully' });
    } catch (err) {
        console.error('Twilio Hangup Error:', err);
        return res.status(500).json({ success: false, msg: 'Failed to terminate call from server' });
    }
};

// The original /voice handler was commented out. Implement it before enabling real calls.
exports.voice = (req, res) => {
    return res.status(501).type('text/plain').send('Twilio voice endpoint is not configured yet.');
};