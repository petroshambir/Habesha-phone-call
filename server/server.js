// require('dotenv').config();

// const express = require('express');
// const cors = require('cors'); // 1. እዚኣ ወስኽ
// const connectDB = require('./config/Db.js');

// const app = express();

// // Middleware
 
// // --- ሓድሽ ናይ CORS ኣወዳድባ (ማዕጾ ምሉእ ብምሉእ ዝኸፈተ) ---
// app.use(cors({
//     origin: '*', // 👈 ንኹሉ ፍሮንትኢንድ ይፈቅድ፣ እቲ CORS Error ሕጂ ክጠፍእ እዩ!
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: false // origin '*' ክኸውን ከሎ credentials false ክኸውን ኣለዎ
// }));

// app.use(express.json());

// // MongoDB Connection
// connectDB(); 
// app.use('/api/admin', require('./routes/Admin.js'));
// // Routes - 3. ነቶም Routes ኣብዚ ኣእትዎም
// // እቲ ናይ Register ን Login ን ኮድ ኣብ routes/auth.js እንተሃሊዩ:
// app.use('/api/auth', require('./routes/Auth.js'));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

require('dotenv').config();

const express = require('express');
const cors = require('cors'); // 1. እዚኣ ወስኽ
const connectDB = require('./config/Db.js');

// 🔄 ሓዳስ ክፍሊ 1፦ Socket.io ንምእታው እዞም ክልተ መስመራት ኣብዚ ተወሲኸም ኣለዉ
const http = require('http');
const { Server } = require('socket.io');

const app = express();

// 🔄 ሓዳስ ክፍሊ 2፦ ናይ ስልኪ ቁጽሪ ከምኡ እውን Socket ID ኣላጊቡ ብድሕሪ ባይታ ዝዕቅብ መዘከርታ (Map)
const usersMap = new Map();

// 🔄 ሓዳስ ክፍሊ 3፦ ነቲ Express app ናብ HTTP Server ንቕይሮ (Socket.io ንክሰርሕ)
const server = http.createServer(app);

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

// 🔄 ሓዳስ ክፍሊ 4፦ እቲ Socket.io ማዕጾ ምስ CORS ሙሉእ ብሙሉእ ክፉት ይኸውን
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// 🔄 ሓዳስ ክፍሊ 5፦ ክልተ ስልካቱ ቪድዮ ክደዋወሉ ከለዉ ኔትወርክ ንክላወጡ (Signaling) ዝገብር ሎጂክ
io.on('connection', (socket) => {
    console.log(`📡 User connected to Video signaling: ${socket.id}`);

    // 🅰️ ሓዳስ መስመር፦ ተጠቃሚ ኦንላይን ምስ ኾነ፣ ቁጽሪ ስልኩን Socket IDን ኣላጊብና ንዕቅቦ
    socket.on('register-user', (phone) => {
        if (phone) {
            usersMap.set(phone, socket.id);
            console.log(`📱 Phone linked: ${phone} ===> Socket: ${socket.id}`);
        }
    });

    // 🅱️ ሓዳስ መስመር፦ ካብ ሂስትሪ ቁጽሪ ስልኪ ተቐቢሉ፣ ናይቲ ሰብ ሓቀኛ Socket ID ፈልዩ ዝምልስ ሎጂክ
    socket.on('get-user-socket', (targetPhone, callback) => {
        const targetSocketId = usersMap.get(targetPhone);
        if (targetSocketId) {
            callback({ success: true, socketId: targetSocketId });
        } else {
            callback({ success: false, message: "User is offline" });
        }
    });

    // 1. ጻውዒት ክጅምር ከሎ (Offer)
    socket.on('call-user', (data) => {
        io.to(data.to).emit('incoming-call', { from: data.from, offer: data.offer });
    });

    // 2. እቲ ጻውዒት ተቐቢለዮ ምስ በለ (Answer)
    socket.on('answer-call', (data) => {
        io.to(data.to).emit('call-accepted', { answer: data.answer });
    });

    // 3. ናይ ኔትወርክ መገዲ መመርመሪያ (ICE Candidate)
    socket.on('ice-candidate', (data) => {
        io.to(data.to).emit('ice-candidate', { candidate: data.candidate });
    });

    socket.on('disconnect', () => {
        // 🔄 ካብ መዘከርታ (Map) ነቲ ዝወጸ ተጠቃሚ ንምእላይ
        for (let [phone, id] of usersMap.entries()) {
            if (id === socket.id) {
                usersMap.delete(phone);
                console.log(`🔌 Phone unlinked: ${phone}`);
                break;
            }
        }
        console.log(`🔌 User disconnected from Video signaling: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;

// 🔄 ሓዳስ ክፍሊ 6፦ ሕጂ ኣብ ክንዲ app.listen፣ በቲ ሓዳስ `server.listen` ጌርና ኢና ነበጋግሶ
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));