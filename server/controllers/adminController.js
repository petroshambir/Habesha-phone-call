const User = require('../Models/User.js');
const Settings = require('../Models/Settings.js');

exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
        return res.status(200).json({ success: true, isAdmin: true, msg: 'Welcome Admin!' });
    }
    return res.status(401).json({ success: false, msg: 'ኢመይል ወይ ፓስዎርድ ጌጋ እዩ' });
};

exports.updateRate = async (req, res) => {
    const { currency, useManualRate, manualRate } = req.body;
    try {
        let finalRate = manualRate !== undefined && manualRate !== '' ? Number(manualRate) : 0;
        if (!Number.isFinite(finalRate) || finalRate < 0) return res.status(400).json({ success: false, msg: 'Manual rate must be a valid non-negative number.' });
        const settings = await Settings.findOneAndUpdate(
            { currency },
            { $set: { useManualRate: Boolean(useManualRate), manualRate: finalRate } },
            { upsert: true, returnDocument: 'after', runValidators: true }
        );
        return res.json({ success: true, settings });
    } catch (err) {
        console.error('Update Rate Error:', err);
        return res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

exports.getStats = async (req, res) => {
    try {
        const stats = await User.aggregate([{ $group: { _id: '$country', count: { $sum: 1 } } }]);
        return res.status(200).json({ success: true, stats });
    } catch (err) {
        console.error('Stats Error:', err);
        return res.status(500).json({ success: false, msg: 'Server Error' });
    }
};

exports.manualUpdateMinutes = async (req, res) => {
    const { phone, minutesToAdd } = req.body;
    const amount = Number(minutesToAdd);
    if (!phone || !Number.isFinite(amount) || amount < 0) return res.status(400).json({ success: false, msg: 'Phone and a valid non-negative minute amount are required.' });
    try {
        const user = await User.findOne({ phoneNumber: phone });
        if (!user) return res.status(404).json({ success: false, msg: 'ተጠቓሚ ኣይተረኽበን!' });
        const [minsRaw, secsRaw] = String(user.minutes || '0:00').split(':');
        const totalSeconds = ((parseInt(minsRaw, 10) || 0) * 60) + (parseInt(secsRaw, 10) || 0) + (Math.floor(amount) * 60);
        const formatted = `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, '0')}`;
        user.minutes = formatted;
        await user.save();
        return res.status(200).json({ success: true, msg: 'ደቂቃ ተወሲኹ!', newBalance: formatted });
    } catch (err) {
        console.error('Manual Update Error:', err);
        return res.status(500).json({ success: false, msg: 'Server Error' });
    }
};