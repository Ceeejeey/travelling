import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if token exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // optional: attach user info to req
    next(); // move to the next middleware/route
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export default verifyToken;
