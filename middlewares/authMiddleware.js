// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const process = require('process');
const blacklist = new Set(); // Example blacklist (in-memory; consider using a database or other store for production)

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token

  if (blacklist.has(token)) return res.sendStatus(403); // Token is blacklisted

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next(); // Proceed to the next middleware/handler
  });
};

module.exports = { authenticateToken, blacklist };
