const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'reddymax123';

// ✅ JWT Middleware Function
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      req.user = user; // { id, role }
      next();
    });
  } else {
    return res.status(401).json({ error: 'Authorization token required' });
  }
};

// ✅ Login Route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        console.error('DB error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = results[0];
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: '1h',
      });

      let responsePayload = {
        token,
        role: user.role,
        id: user.id,
      };

      if (user.role === 'student') {
        responsePayload.relatedStudentId = user['related-student-id']; // Adjust field if needed
      } else if (user.role === 'teacher') {
        responsePayload.relatedTeacherId = user['related-teacher-id']; // Adjust field if needed
      }

      res.json(responsePayload);
    }
  );
});

// ✅ Export router and middleware
module.exports = router;
module.exports.authenticateJWT = authenticateJWT;

