
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



// require('dotenv').config();

// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/Db.js');

// const app = express();

// // 1. CORS Configuration
// app.use(cors({
//     origin: '*',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     credentials: true
// }));

// // 2. Body Parser Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // 3. Connect to MongoDB Atlas
// connectDB();

// // 4. Import Routes
// const authRoutes = require('./routes/authRoutes.js');
// const adminRoutes = require('./routes/adminRoutes.js');
// const callRoutes = require('./routes/callRoutes.js');
// // const userRoutes = require('./routes/userRoutes.js');
// const userRoutes = require('./routes/UserRoutes.js'); // ናይ User ኣብ ኣሁን ዝተለዋዋጠ ፋይል
// const paymentRoutes = require('./routes/paymentRoutes.js');
// // 5. Connect Routes

// // Login, Register, Verify OTP
// app.use('/api/auth', authRoutes);

// // Twilio Calls
// app.use('/api/auth', callRoutes);

// // User Profile, Minutes, Rates, Payment Methods
// app.use('/api/auth', userRoutes);

// // Admin endpoints — ንኣረጊት API paths ንምጽናሕ
// app.use('/api/auth', adminRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/payments', paymentRoutes);

// // 6. Start Server
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
// });



// require('dotenv').config();

// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/Db.js');

// const app = express();

// const allowedOrigins = [
//     process.env.FRONTEND_URL
// ].filter(Boolean);

// app.use(cors({
//     origin: (origin, callback) => {
//         if (
//             !origin ||
//             allowedOrigins.includes(origin)
//         ) {
//             return callback(null, true);
//         }

//         return callback(new Error('Origin not allowed by CORS'));
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true
// }));

// app.use(express.json({ limit: '1mb' }));
// app.use(express.urlencoded({
//     extended: true,
//     limit: '1mb'
// }));

// const authRoutes = require('./routes/authRoutes.js');
// const adminRoutes = require('./routes/adminRoutes.js');
// const callRoutes = require('./routes/callRoutes.js');
// const userRoutes = require('./routes/UserRoutes.js');
// const paymentRoutes = require('./routes/paymentRoutes.js');

// app.get('/api/health', (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: 'HabeshaTele API is running'
//     });
// });

// app.use('/api/auth', authRoutes);
// app.use('/api/auth', callRoutes);
// app.use('/api/auth', userRoutes);
// app.use('/api/auth', adminRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/payments', paymentRoutes);

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//     try {
//         await connectDB();

//         app.listen(PORT, () => {
//             console.log(`HabeshaTele server running on port ${PORT}`);
//         });
//     } catch (err) {
//         console.error('Database connection failed:', err.message);
//         process.exit(1);
//     }
// };

// startServer();


// require('dotenv').config();

// const express = require('express');
// const cors = require('cors');
// const connectDB = require('./config/Db.js');

// const app = express();

// const allowedOrigins = [
//     process.env.FRONTEND_URL
// ].filter(Boolean);

// app.use(cors({
//     origin: (origin, callback) => {
//         // Permit server-to-server requests and clients without an Origin header.
//         if (!origin || allowedOrigins.includes(origin)) {
//             return callback(null, true);
//         }

//         return callback(new Error('Origin not allowed by CORS'));
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: [
//         'Content-Type',
//         'Authorization',
//         'Idempotency-Key'
//     ],
//     credentials: true
// }));

// // Parse JSON and URL-encoded requests.
// app.use(express.json({ limit: '1mb' }));
// app.use(express.urlencoded({
//     extended: true,
//     limit: '1mb'
// }));

// const authRoutes = require('./routes/authRoutes.js');
// const adminRoutes = require('./routes/adminRoutes.js');
// const callRoutes = require('./routes/callRoutes.js');
// const userRoutes = require('./routes/UserRoutes.js');
// const paymentRoutes = require('./routes/paymentRoutes.js');

// app.get('/api/health', (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: 'HabeshaTele API is running'
//     });
// });

// app.use('/api/auth', authRoutes);
// app.use('/api/auth', callRoutes);
// app.use('/api/auth', userRoutes);

// // Keep these two mounts only if both route prefixes are intentional
// // and adminRoutes applies the required admin authorization.
// app.use('/api/auth', adminRoutes);
// app.use('/api/admin', adminRoutes);

// app.use('/api/payments', paymentRoutes);

// // Central error handler.
// app.use((err, req, res, next) => {
//     if (res.headersSent) {
//         return next(err);
//     }

//     if (err.message === 'Origin not allowed by CORS') {
//         return res.status(403).json({
//             success: false,
//             msg: 'This origin is not allowed.'
//         });
//     }

//     console.error('Server Error:', err.message);

//     return res.status(500).json({
//         success: false,
//         msg: 'An unexpected server error occurred.'
//     });
// });

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//     try {
//         await connectDB();

//         app.listen(PORT, () => {
//             console.log(`HabeshaTele server running on port ${PORT}`);
//         });
//     } catch (err) {
//         console.error('Database connection failed:', err.message);
//         process.exit(1);
//     }
// };

// startServer();

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/Db.js');

const app = express();

const allowedOrigins = [
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Origin not allowed by CORS'));
    },

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Idempotency-Key'
    ],

    credentials: true
}));

// Stripe webhook requires the original raw request body.
// This must be registered before express.json().
app.use(
    '/api/payments/webhooks/stripe',
    express.raw({
        type: 'application/json',
        limit: '1mb'
    })
);

// Parse regular API request bodies.
app.use(express.json({
    limit: '1mb'
}));

app.use(express.urlencoded({
    extended: true,
    limit: '1mb'
}));

const authRoutes = require('./routes/authRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const callRoutes = require('./routes/callRoutes.js');
const userRoutes = require('./routes/UserRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'HabeshaTele API is running'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/auth', callRoutes);
app.use('/api/auth', userRoutes);

// Keep both mounts only if both route prefixes are intentional.
app.use('/api/auth', adminRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/payments', paymentRoutes);

// Central error handler.
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err.message === 'Origin not allowed by CORS') {
        return res.status(403).json({
            success: false,
            msg: 'This origin is not allowed.'
        });
    }

    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            msg: 'Request body is too large.'
        });
    }

    console.error('Server Error:', err.message);

    return res.status(500).json({
        success: false,
        msg: 'An unexpected server error occurred.'
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(
                `HabeshaTele server running on port ${PORT}`
            );
        });
    } catch (err) {
        console.error(
            'Database connection failed:',
            err.message
        );

        process.exit(1);
    }
};

startServer();