

// const express = require('express');
// const router = express.Router();
// const User = require('../Models/User.js'); // 👈 Path ጽቡቕ ምህላዉ ኣረጋግጽ (.js ተወሲኹ ኣሎ)

// // 🧮 1. በብሃገሩ ዘለዉ ተጠቀምቲ ቁጽሪ መውጽኢ API (Stats)
// router.get('/stats', async (req, res) => {
//     try {
//         const stats = await User.aggregate([
//             // በብ ሃገሩ ይምድቦም (Group by country)
//             { $group: { _id: "$country", count: { $sum: 1 } } }
//         ]);
        
//         // እቲ ዝስደድ ዳታ [{_id: "UG", count: 1}] ኮይኑ ክኸይድ እዩ
//         res.status(200).json({ success: true, stats });
//     } catch (err) { 
//         console.error("❌ Stats Error:", err);
//         res.status(500).json({ success: false, msg: "Server Error" }); 
//     }
// });

// // ➕ 2. Manual Add Minutes (ደቂቕ ንተጠቃሚ ብኢድካ ምውሳኽ)
// router.put('/manual-update', async (req, res) => {
//     const { phone, minutesToAdd } = req.body; 
    
//     try {
//         const user = await User.findOne({ phoneNumber: phone });
//         if (!user) {
//             return res.status(404).json({ success: false, msg: "ተጠቓሚ ኣይተረኽበን!" });
//         }

//         // 🛡️ NaN ንምክልኻል DB minutes ንረጋገጽ
//         let dbMinutes = user.minutes || "0:00";
//         if (typeof dbMinutes !== 'string' || !dbMinutes.includes(':')) {
//             dbMinutes = "0:00";
//         }

//         // 1. ኣብ DB ዝነበረ ደቂቕ ናብ ሰከንድ ንቕይሮ
//         const timeParts = dbMinutes.split(':');
//         const currentMins = parseInt(timeParts[0]) || 0;
//         const currentSecs = parseInt(timeParts[1]) || 0;
//         let currentTotalSeconds = (currentMins * 60) + currentSecs;

//         // 2. ሓድሽ ዝመጸ (minutesToAdd) ደምሮ
//         const addValue = parseInt(minutesToAdd) || 0;
//         let finalTotalSeconds = currentTotalSeconds + (addValue * 60);

//         // 3. ተመሊሱ ናብ "MM:SS" ፎርማት ንቕይሮ
//         const finalMinutes = Math.floor(finalTotalSeconds / 60);
//         const finalSeconds = finalTotalSeconds % 60;
//         const formatted = `${finalMinutes}:${finalSeconds.toString().padStart(2, '0')}`;

//         // 4. ኣብ DB ሴቭ ንግበሮ
//         user.minutes = formatted;
//         await user.save();

//         res.status(200).json({ success: true, msg: "ደቂቃ ተወሲኹ!", newBalance: formatted });
//     } catch (err) { 
//         console.error("❌ Manual Update Error:", err);
//         res.status(500).json({ success: false, msg: "Server Error" }); 
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../Models/User.js');
const Settings = require('../Models/Settings.js');

// Admin Login API
router.post('/login-admin', async (req, res) => {
    const { email, password } = req.body;

    if (
        email === (process.env.ADMIN_EMAIL || "admin@habeshatele.com") &&
        password === (process.env.ADMIN_PASS || "Admin@1234")
    ) {
        return res.status(200).json({
            success: true,
            isAdmin: true,
            msg: "Welcome Admin!"
        });
    }

    return res.status(401).json({
        success: false,
        msg: "ኢመይል ወይ ፓስዎርድ ጌጋ እዩ"
    });
});

// Admin update currency rate API
router.post('/admin/update-rate', async (req, res) => {
    const { currency, useManualRate, manualRate } = req.body;
    try {
        let finalRate = manualRate && manualRate !== "" ? Number(manualRate) : 0;

        if (isNaN(finalRate)) {
            finalRate = 0;
        }

        const settings = await Settings.findOneAndUpdate(
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
        res.status(500).json({ success: false, msg: "Server Error" });
    }
});

// Admin user statistics API
router.get('/stats', async (req, res) => {
    try {
        const stats = await User.aggregate([
            { $group: { _id: "$country", count: { $sum: 1 } } }
        ]);
        res.status(200).json({ success: true, stats });
    } catch (err) {
        console.error("❌ Stats Error:", err);
        res.status(500).json({ success: false, msg: "Server Error" });
    }
});

// Admin manual minutes update API
router.put('/manual-update', async (req, res) => {
    const { phone, minutesToAdd } = req.body;
    try {
        const user = await User.findOne({ phoneNumber: phone });

        if (!user) {
            return res.status(404).json({ success: false, msg: "ተጠቓሚ ኣይተረኽበን!" });
        }

        let dbMinutes = user.minutes || "0:00";
        if (typeof dbMinutes !== 'string' || !dbMinutes.includes(':')) {
            dbMinutes = "0:00";
        }

        const timeParts = dbMinutes.split(':');
        const currentMins = parseInt(timeParts[0]) || 0;
        const currentSecs = parseInt(timeParts[1]) || 0;
        const currentTotalSeconds = (currentMins * 60) + currentSecs;
        const addValue = parseInt(minutesToAdd) || 0;
        const finalTotalSeconds = currentTotalSeconds + (addValue * 60);
        const finalMinutes = Math.floor(finalTotalSeconds / 60);
        const finalSeconds = finalTotalSeconds % 60;
        const formatted = `${finalMinutes}:${finalSeconds.toString().padStart(2, '0')}`;

        user.minutes = formatted;
        await user.save();

        res.status(200).json({
            success: true,
            msg: "ደቂቃ ተወሲኹ!",
            newBalance: formatted
        });
    } catch (err) {
        console.error("❌ Manual Update Error:", err);
        res.status(500).json({ success: false, msg: "Server Error" });
    }
});

module.exports = router;