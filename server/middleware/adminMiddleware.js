// function adminMiddleware(req, res, next) {
//     if (!req.user || req.user.role !== 'admin') {
//         return res.status(403).json({ success: false, msg: 'Admin access required.' });
//     }
//     return next();
// }

// module.exports = adminMiddleware;

function adminMiddleware(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            msg: 'Admin access required.'
        });
    }

    return next();
}

module.exports = adminMiddleware;