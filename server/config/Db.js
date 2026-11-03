// const mongoose = require('mongoose');

// const connectDB = () => {
//     mongoose.connect(process.env.MONGO_URI)
//         .then(() => console.log('🚀 MongoDB Connected!'))
//         .catch((err) => console.log('❌ Connection Error:', err.message));
// };

// module.exports = connectDB;


const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not configured.');
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB Connected!');
};

module.exports = connectDB;
