// Use JWT (JSON Web Token), a modern approach where the server does not store session data.
// Issue an encrypted token to the user,
// which contains information such as: "This is a user, they have specific roles, and the token is valid until a certain time." Verify the digital signature on this token.
// This is faster because it does not require database access on every request to check the session.
// This is more reliable for scaling.
const jwt = require('jsonwebtoken');

// Define function to generate a token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d' // Set token expiration to 30 days
    });
};

module.exports = generateToken; // Export function for use in other parts of the application