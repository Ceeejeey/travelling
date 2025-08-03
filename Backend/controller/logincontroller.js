import express from 'express';
import jwt from 'jsonwebtoken'; 

const loginrouter = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET; // Get the JWT secret

// Admin Login Route
loginrouter.post('/login', (req, res) => {
    console.log('Received request body:', req.body);

    const { email, password } = req.body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Login successful - Now generate a JWT
        try {
            // --- ADDED DEBUGGING HERE ---
            console.log('Attempting to sign JWT. JWT_SECRET:', JWT_SECRET ? 'Loaded' : 'UNDEFINED/NULL');
            if (!JWT_SECRET) {
                console.error('JWT_SECRET is missing! Cannot generate token.');
                return res.status(500).json({ success: false, message: 'Server configuration error: JWT secret missing.' });
            }
            // --- END ADDED DEBUGGING ---

            // Payload for the JWT. You can add more user-specific data here.
            const payload = {
                userId: 'admin_user_id_123', 
                email: email,
                role: 'admin' 
            };

            // Sign the token
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

            console.log('Login successful for:', email);
            return res.status(200).json({
                success: true,
                message: 'Login successful!',
                token: token 
            });
        } catch (error) {
            console.error('Error generating JWT:', error);
            // Provide a more specific error message if the secret is the issue
            if (!JWT_SECRET) {
                return res.status(500).json({ success: false, message: 'Internal server error: JWT secret not configured.' });
            }
            return res.status(500).json({ success: false, message: 'Internal server error during token generation.' });
        }
    } else {
        // Failed login
        console.log('Login failed for:', email);
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
});

export default loginrouter;
