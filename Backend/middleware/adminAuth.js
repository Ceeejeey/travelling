import jwt from 'jsonwebtoken';

const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.json({ success: false, message: "Not authorized: Token missing." });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.json({ success: false, message: "Not authorized: Token format invalid." });
        }

        // Verify the token and get its payload
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        // --- THE CRUCIAL CHANGE IS HERE ---
        // Instead of comparing the entire decoded token to a concatenated string,
        // check a specific property within the decoded payload (e.g., 'role' or 'email')
        
        // Option 1: Check for a 'role' property (Recommended for RBAC)
        if (token_decode.role !== 'admin') { // Assuming your JWT payload includes a 'role'
            return res.json({ success: false, message: "Not authorized: User is not an admin." });
        }

        // Option 2: Check for a specific admin email (Less flexible than roles, but works)
        // Ensure that process.env.ADMIN_EMAIL is the *exact* email you put into the token.
        // if (token_decode.email !== process.env.ADMIN_EMAIL) {
        //     return res.json({ success: false, message: "Not authorized: Invalid admin email." });
        // }

        // You might also want to attach the user info to the request for later use
        req.user = token_decode; // e.g., req.user.id, req.user.email, req.user.role

        // If everything is fine, proceed to the next middleware or route handler
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.json({ success: false, message: "Token expired. Please log in again." });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.json({ success: false, message: "Invalid token." });
        }
        console.error("Authentication error:", error);
        return res.json({ success: false, message: "An unexpected authentication error occurred." });
    }
};

export default adminAuth;