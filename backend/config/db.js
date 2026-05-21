const mongoose = require('mongoose'); // Import Mongoose library for MongoDB interaction

const connectDB = async (dbUri = process.env.MONGODB_URI) => {
    try {
        await mongoose.connect(dbUri);
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1); // Stop server if connection fails
    }
};

module.exports = connectDB; // Export function for use in server.js