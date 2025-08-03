// middleware/auth.js

import jwt from 'jsonwebtoken'; // Import jsonwebtoken

// Ensure JWT_SECRET is loaded from environment variables
// In a real application, you might want to ensure dotenv is configured
// in your main server.js, so process.env.JWT_SECRET is always available.
const JWT_SECRET = process.env.JWT_SECRET; 

const authMiddleware = (req, res, next) => {
    // Check if JWT_SECRET is defined (safety check)
    if (!JWT_SECRET) {
        console.error('JWT_SECRET is not defined. Cannot perform authentication.');
        return res.status(500).json({ success: false, message: 'Server configuration error.' });
    }

    // Get the token from the Authorization header
    // The token is typically sent as "Bearer YOUR_TOKEN_STRING"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // If no Authorization header or not a Bearer token
        return res.status(401).json({ success: false, message: 'Not authorized, no token or invalid token format.' });
    }

    // Extract the token string (remove "Bearer ")
    const token = authHeader.split(' ')[1];

    try {
        // Verify the token
        // This will throw an error if the token is invalid or expired
        const decodedToken = jwt.verify(token, JWT_SECRET);

        // Attach the decoded token payload to the request object
        // This makes user info (like userId, role) available in subsequent route handlers
        req.admin = decodedToken; // Using 'req.admin' to be specific for admin panel

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        // Handle different JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
        }
        return res.status(401).json({ success: false, message: 'Not authorized, token failed.' });
    }
};

export default authMiddleware;
