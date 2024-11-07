// server/src/middleware/error.middleware.js
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    const error = {
        status: err.status || 500,
        message: err.message || 'Internal Server Error'
    };

    // Send error response
    res.status(error.status).json({
        status: 'error',
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;