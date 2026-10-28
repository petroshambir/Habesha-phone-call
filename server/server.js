
// require('dotenv').config();

// const express = require('express');
// const cors = require('cors'); 
// const connectDB = require('./config/Db.js'); // 👈 ናይ Database መላገጺ ፋይልካ
// const twilio = require('twilio');

// console.log("SID Check:", process.env.TWILIO_ACCOUNT_SID ? "Found" : "MISSING");
// const app = express();

// // 🌐 1. CORS Configuration
// app.use(cors({
//     origin: '*', 
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true // እቲ ኣሁን ዝተወሰኸ CORS ክፍሊ ከሎ credentials true ክኸውን ኣለዎ
// }));

// // 📦 2. Body Parser Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // ንTwilio ጻውዒት (Form data)

// // 🗄️ 3. Connect to MongoDB Atlas
// connectDB(); 

// // // 🛣️ 4. API Routes Connection
// // // app.use('/api/auth', require('./routes/Auth.js'));   // ናይ Register, Login, Twilio Call
// // app.use('/api/admin', require('./routes/Admin.js')); // ናይ Stats, Manual Update
// // // app.use('/api/call', require('./routes/Auth.js'));
// // app.use('/api', require('./routes/Auth.js'));

// app.use('/api/auth', require('./routes/auth.js'));

// // 2. Admin ዝምልከት ኩሉ ብ /api/admin ይጅምር
// app.use('/api/admin', require('./routes/admin.js'));

// // 🚀 5. Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));



require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/Db.js');

const app = express();

// 1. CORS Configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// 2. Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Connect to MongoDB Atlas
connectDB();

// 4. Import Routes
const authRoutes = require('./routes/authRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const callRoutes = require('./routes/callRoutes.js');
// const userRoutes = require('./routes/userRoutes.js');
const userRoutes = require('./routes/UserRoutes.js'); // ናይ User ኣብ ኣሁን ዝተለዋዋጠ ፋይል
// 5. Connect Routes

// Login, Register, Verify OTP
app.use('/api/auth', authRoutes);

// Twilio Calls
app.use('/api/auth', callRoutes);

// User Profile, Minutes, Rates, Payment Methods
app.use('/api/auth', userRoutes);

// Admin endpoints — ንኣረጊት API paths ንምጽናሕ
app.use('/api/auth', adminRoutes);
app.use('/api/admin', adminRoutes);

// 6. Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
