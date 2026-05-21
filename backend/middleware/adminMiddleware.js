const admin = (req, res, next) => {
    // Check if user has admin role
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора.' });
    }
};

module.exports = admin;