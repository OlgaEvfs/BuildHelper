const express = require('express');
const router = express.Router();
// Add authUser to imports
const { registerUser, authUser, updatePassword } = require('../controllers/authController'); // Import registration function from controller
const protect = require('../middleware/authMiddleware'); // Import middleware for route protection

// Define registration route
router.post('/register', registerUser);

// Define login route
router.post('/login', authUser);

// Set up protected route requiring authorization
router.get('/profile', protect, (req, res) => {
    res.json(req.user); // Return user data found by protector
});

// Set up password change route
// Use .put for updating data
// Protect middleware verifies the token
router.put('/updatepassword', protect, updatePassword);

module.exports = router; // Export router for use in server.js