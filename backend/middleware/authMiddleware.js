const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token and extract user ID
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user by ID and attach to request object
            // Exclude password from query result
            req.user = await User.findById(decoded.id).select('-password');
            
            if (req.user && req.user.status === 'banned') {
                return res.status(403).json({ message: 'Ваш аккаунт заблокирован администратором' });
            }

            next(); // Move to next middleware
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Неверный или истекший токен' });
        }
    }
    
    if (!token) {
        res.status(401).json({ message: 'Неверный или истекший токен' });
    }

    

};

module.exports = protect;