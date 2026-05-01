

const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/stats', async (req, res) => {
    try {
        const stats = await User.aggregate([
            // በብ ሃገሩ ይምድቦም
            { $group: { _id: "$country", count: { $sum: 1 } } }
        ]);
        // እቲ ዝስደድ ዳታ [{_id: "UG", count: 1}] ኮይኑ ክኸይድ ኣለዎ
        res.status(200).json({ success: true, stats });
    } catch (err) { res.status(500).json({ success: false }); }
});



// 2. Manual Add Minutes (ዝተወሃሃደ መፍትሒ)
router.put('/manual-update', async (req, res) => {
    const { phone, minutesToAdd } = req.body; 
    
    try {
        const user = await User.findOne({ phoneNumber: phone });
        if (!user) return res.status(404).json({ success: false, msg: "ተጠቓሚ ኣይተረኽበን!" });

        // NaN ንምክልኻል DB minutes ነረጋግጽ
        let dbMinutes = user.minutes || "0:00";
        if (typeof dbMinutes !== 'string' || !dbMinutes.includes(':')) dbMinutes = "0:00";

        // 1. ዝነበረ ናብ ሰከንድ
        const timeParts = dbMinutes.split(':');
        const currentMins = parseInt(timeParts[0]) || 0;
        const currentSecs = parseInt(timeParts[1]) || 0;
        let currentTotalSeconds = (currentMins * 60) + currentSecs;

        // 2. ሓድሽ ዝመጸ (minutesToAdd) ደምሮ
        const addValue = parseInt(minutesToAdd) || 0;
        let finalTotalSeconds = currentTotalSeconds + (addValue * 60);

        // 3. ተመሊሱ ናብ "MM:SS"
        const finalMinutes = Math.floor(finalTotalSeconds / 60);
        const finalSeconds = finalTotalSeconds % 60;
        const formatted = `${finalMinutes}:${finalSeconds.toString().padStart(2, '0')}`;

        user.minutes = formatted;
        await user.save();

        res.status(200).json({ success: true, msg: "ደቂቃ ተወሲኹ!", newBalance: formatted });
    } catch (err) { res.status(500).json({ success: false, msg: "Server Error" }); }
});

module.exports = router;
