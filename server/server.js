


require('dotenv').config();

const express = require('express');
const cors = require('cors'); 
const connectDB = require('./config/Db.js'); // 👈 ናይ Database መላገጺ ፋይልካ
const twilio = require('twilio');

console.log("SID Check:", process.env.TWILIO_ACCOUNT_SID ? "Found" : "MISSING");
const app = express();

// 🌐 1. CORS Configuration
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // እቲ ኣሁን ዝተወሰኸ CORS ክፍሊ ከሎ credentials true ክኸውን ኣለዎ
}));

// 📦 2. Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ንTwilio ጻውዒት (Form data)

// 🗄️ 3. Connect to MongoDB Atlas
connectDB(); 

// // 🛣️ 4. API Routes Connection
// // app.use('/api/auth', require('./routes/Auth.js'));   // ናይ Register, Login, Twilio Call
// app.use('/api/admin', require('./routes/Admin.js')); // ናይ Stats, Manual Update
// // app.use('/api/call', require('./routes/Auth.js'));
// app.use('/api', require('./routes/Auth.js'));

app.use('/api/auth', require('./routes/Auth.js'));

// 2. Admin ዝምልከት ኩሉ ብ /api/admin ይጅምር
app.use('/api/admin', require('./routes/Admin.js'));

// 🚀 5. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));