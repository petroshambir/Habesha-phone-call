require('dotenv').config();

const express = require('express');
const cors = require('cors'); // 1. እዚኣ ወስኽ
const connectDB = require('./config/Db.js');

const app = express();

// Middleware
 
// --- ሓድሽ ናይ CORS ኣወዳድባ (ማዕጾ ምሉእ ብምሉእ ዝኸፈተ) ---
app.use(cors({
    origin: '*', // 👈 ንኹሉ ፍሮንትኢንድ ይፈቅድ፣ እቲ CORS Error ሕጂ ክጠፍእ እዩ!
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: false // origin '*' ክኸውን ከሎ credentials false ክኸውን ኣለዎ
}));

app.use(express.json());

// MongoDB Connection
connectDB(); 
app.use('/api/admin', require('./routes/Admin.js'));
// Routes - 3. ነቶም Routes ኣብዚ ኣእትዎም
// እቲ ናይ Register ን Login ን ኮድ ኣብ routes/auth.js እንተሃሊዩ:
app.use('/api/auth', require('./routes/Auth.js'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
