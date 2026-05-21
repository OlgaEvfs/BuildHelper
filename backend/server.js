require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const checkEmailRoutes = require('./routes/checkEmail');
const newsRoutes = require('./routes/news');
const commentRoutes = require('./routes/comments');
const calculationRoutes = require('./routes/calculations');
const checklistRoutes = require('./routes/checklist');
const plannerRoutes = require('./routes/planner');
const adminRoutes = require('./routes/admin');
const supportRoutes = require('./routes/support');

// Import connection function from db.js
const connectDB = require('./config/db');

// Initialize Express application
const app = express();

// Connect to database
connectDB();

// Middleware configuration
app.use(cors()); // Configure CORS to allow frontend to access backend
app.use(express.json()); // Allow server to parse JSON in requests (for POST/PUT)
app.use(express.urlencoded({ extended: true })); // Add support for standard URL-encoded forms

// Register API routes
app.use('/api/auth', authRoutes); // All authentication routes start with /api/auth
app.use('/api/check-email', checkEmailRoutes);

// News routes
app.use('/api/news', newsRoutes); // All news routes start with /api/news

// Comment routes
app.use('/api/comments', commentRoutes);

// Calculation storage routes
app.use('/api/calculations', calculationRoutes);

// Checklist routes
app.use('/api/checklist', checklistRoutes);

// Planner routes
app.use('/api/planner', plannerRoutes);

// Support request routes
app.use('/api/support', supportRoutes);

// Admin panel routes
app.use('/api/admin', adminRoutes);

// Test route
app.get('/api/test', (req, res) => {
    // Use res.json to ensure the frontend receives a JSON response
    res.json({ message: 'This is a test endpoint' });
});

// Serve static files for the frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Redirect all other GET requests to index.html (preparing for SPA)
app.get('*path', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../frontend/404.html'));
});

// Get port from environment variables
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});