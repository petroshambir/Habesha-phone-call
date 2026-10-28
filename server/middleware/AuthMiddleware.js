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

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({
            success: false,
            msg: 'Authentication required.'
        });
    }

    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is missing from environment variables.');
        return res.status(500).json({
            success: false,
            msg: 'Server configuration error.'
        });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        return next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            msg: 'Invalid or expired token.'
        });
    }
}

module.exports = authMiddleware;