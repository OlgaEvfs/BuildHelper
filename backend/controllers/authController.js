// Handle user registration and authentication
const User = require('../models/User');
const generateToken = require('../config/utils');

// Register a new user
// Route: POST /api/auth/register
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Perform a simple check for the presence of data
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
    }

    // Check password complexity: minimum 8 characters, at least one digit and one uppercase letter
    const passwordRegex = /^(?=.*\d)(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            message: 'Пароль слишком слабый. Он должен содержать минимум 8 символов, одну заглавную букву и одну цифру.' 
        });
    }

    try {
        // Check if a user with this email already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Create a new user (password will be automatically hashed by model middleware)
        const user = await User.create({
            username,
            email,
            password
        });

        if (user) {
            // Return user data and token upon successful creation
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user._id) // Generate JWT token
            });
        } else {
            res.status(400).json({ message: 'Некорректные данные пользователя' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Authenticate user and get token
// Route: POST /api/auth/login
const authUser = async (req, res) => {
    const { email, password } = req.body;

    // Perform a simple check for the presence of data
    if (!email || !password) {
        return res.status(400).json({ message: 'Пожалуйста заполните все поля' });
    }

    try {
        // Find user by email
        const user = await User.findOne({ email });

        // Check if password matches
        // (Use the matchPassword method added to the User.js model earlier)
        if (user && (await user.matchPassword(password))) {

            if (user.status === 'banned') {
                return res.status(403).json({ message: 'Доступ запрещен. Ваш аккаунт заблокирован' });
            }

            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                status: user.status,
                resetPasswordRequired: user.resetPasswordRequired,
                token: generateToken(user._id) // Generate JWT token
            });
        } else {
            // Return error if user is not found or password does not match
            res.status(401).json({ message: 'Неверный email или пароль' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update password
// Route: PUT /api/auth/updatepassword
// Access: Private (authorized only)
const updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    // Check if user provided data
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Пожалуйста, заполните все поля' });
    }

    try {
        // Find user in database
        // req.user._id is obtained from the protect middleware added to the routes
        const user = await User.findById(req.user._id);

        // Check if the old password matches the one in the database
        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный текущий пароль' });
        }

        // Record the new password
        user.password = newPassword;
        user.resetPasswordRequired = false;
        
        await user.save();

        res.json({ message: 'Пароль успешно изменен' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера при смене пароля' });
    }
};

module.exports = { registerUser, authUser, updatePassword }; // Export functions for use in routes