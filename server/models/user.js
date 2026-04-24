const mongoose = require('mongoose');

// ሓደ Schema ጥራይ ተጠቐም (ፓስወርድ ዘይብሉ)
const UserSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    phoneNumber: { 
        type: String, 
        required: true, 
        unique: true 
    },
    minutes: { 
        type: String, 
        default: "10:00" 
    }
}, { timestamps: true }); // timestamps ምስ እትውስኽ መዓስ ከም ዝተመዝገቡ ይሕብረካ

// ሓንሳብ ጥራይ Export ግበሮ
module.exports = mongoose.model('User', UserSchema);