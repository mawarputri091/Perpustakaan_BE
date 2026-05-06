const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(new AppError('TOKEN_REQUIRED', 401));
    }

    const token = authHeader.split(' ')[1];

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        next(new AppError('INVALID_TOKEN', 401));
    }
};

const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('FORBIDDEN', 403));
    }
    next();
};

module.exports = { authenticateToken, authorizeAdmin };