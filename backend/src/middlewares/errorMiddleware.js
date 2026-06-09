const errorMiddleware = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${err.message}`);

    if (err.type === 'UNAUTHORIZED') {
        return res.status(401).json({
            error_code: 'UNAUTHORIZED',
            message: err.message || 'Authentication required',
        });
    }
    if (err.type === 'FORBIDDEN') {
        return res.status(403).json({
            error_code: 'FORBIDDEN',
            message: err.message || 'You do not have permission to perform this action',
        });
    }
    if (err.type === 'NOT_FOUND') {
        return res.status(404).json({
            error_code: 'NOT_FOUND',
            message: err.message || 'Resource not found',
        });
    }
    if (err.type === 'BAD_REQUEST') {
        return res.status(400).json({
            error_code: 'BAD_REQUEST',
            message: err.message || 'Bad request',
        });
    }
    return res.status(500).json({
        error_code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong on the server',
    });
};

const notFoundMiddleware = (req, res) => {
    res.status(404).json({
        error_code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
};

module.exports = { errorMiddleware, notFoundMiddleware };