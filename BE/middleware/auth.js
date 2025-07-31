const jwt = require('jsonwebtoken');

// Define JWT_SECRET - should match the one in routes/auth.js
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.log('JWT verification error:', err.message); // DEBUG LOG
        return res.sendStatus(403); // Forbidden
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};

module.exports = authenticateJWT;