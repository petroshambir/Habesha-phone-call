function notFoundMiddleware(req, res, next) {
    res.status(404).json({ success: false, msg: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorMiddleware(err, req, res, next) {
    console.error('Unhandled API Error:', err);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({
        success: false,
        msg: process.env.NODE_ENV === 'production' ? 'Server Error' : (err.message || 'Server Error')
    });
}

module.exports = { notFoundMiddleware, errorMiddleware };