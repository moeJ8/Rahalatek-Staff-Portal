const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token for protected routes
 */
exports.verifyToken = (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yoursecretkey');
        
        // Add user data to request
        req.user = {
            userId: decoded.userId,
            isAdmin: decoded.isAdmin
        };
        
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
}; 