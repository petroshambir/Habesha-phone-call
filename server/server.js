require('dotenv').config();
const express = require('express');
const cors = require('cors'); // 1. እዚኣ ወስኽ
const connectDB = require('./config/Db.js');

const app = express();

// Middleware
app.use(cors()); // 2. እዚኣ ወስኽ
app.use(express.json());

// MongoDB Connection
connectDB(); 

// Routes - 3. ነቶም Routes ኣብዚ ኣእትዎም
// እቲ ናይ Register ን Login ን ኮድ ኣብ routes/auth.js እንተሃሊዩ:
app.use('/api/auth', require('./routes/auth.js'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));