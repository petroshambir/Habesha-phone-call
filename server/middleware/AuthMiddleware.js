// const jwt = require('jsonwebtoken');

// function authMiddleware(req, res, next) {
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.startsWith('Bearer ')
//         ? authHeader.slice(7)
//         : null;

//     if (!token) {
//         return res.status(401).json({ success: false, msg: 'Authentication required.' });
//     }

//     if (!process.env.JWT_SECRET) {
//         console.error('JWT_SECRET is missing from environment variables.');
//         return res.status(500).json({ success: false, msg: 'Server configuration error.' });
//     }

//     try {
//         req.user = jwt.verify(token, process.env.JWT_SECRET);
//         return next();
//     } catch (err) {
//         return res.status(401).json({ success: false, msg: 'Invalid or expired token.' });
//     }
// }

// module.exports = authMiddleware;

// const jwt = require('jsonwebtoken');

// function authMiddleware(req, res, next) {
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.startsWith('Bearer ')
//         ? authHeader.slice(7)
//         : null;

//     if (!token) {
//         return res.status(401).json({
//             success: false,
//             msg: 'Authentication required.'
//         });
//     }

//     if (!process.env.JWT_SECRET) {
//         console.error('JWT_SECRET is missing from environment variables.');
//         return res.status(500).json({
//             success: false,
//             msg: 'Server configuration error.'
//         });
//     }

//     try {
//         req.user = jwt.verify(token, process.env.JWT_SECRET);
//         return next();
//     } catch (err) {
//         return res.status(401).json({
//             success: false,
//             msg: 'Invalid or expired token.'
//         });
//     }
// }

// module.exports = authMiddleware;


const jwt = require('jsonwebtoken');
const User = require('../Models/User.js');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                msg: 'Authentication token is required.'
            });
        }

        const token = authHeader.slice(7);

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured.');

            return res.status(500).json({
                success: false,
                msg: 'Server configuration error.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.userId) {
            return res.status(401).json({
                success: false,
                msg: 'Invalid authentication token.'
            });
        }

        const user = await User.findById(decoded.userId).select(
            '_id email phoneNumber currency country minutes deviceId'
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                msg: 'User account not found.'
            });
        }

        req.user = user;
        next();
    } catch (err) {
        if (
            err.name === 'JsonWebTokenError' ||
            err.name === 'TokenExpiredError'
        ) {
            return res.status(401).json({
                success: false,
                msg: 'Invalid or expired authentication token.'
            });
        }

        console.error('Authentication Error:', err.message);

        return res.status(500).json({
            success: false,
            msg: 'Server Error'
        });
    }
};
