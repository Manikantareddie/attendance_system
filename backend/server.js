// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'reddymax123';

// Load routes
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());
app.use('/auth', authRoutes);

// Middleware to verify token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1] || req.cookies?.token;

  if (!token) {
    return res.redirect('/login.html');
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.redirect('/login.html');
    }
    req.user = user;
    next();
  });
}

// ✅ Serve login page on root first
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'login.html'));
});

// ✅ Then serve static files (this must come AFTER the '/' route)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Protect dashboard routes
app.get('/student-dashboard.html', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'student-dashboard.html'));
});

app.get('/teacher-dashboard.html', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'teacher-dashboard.html'));
});

// Use the API routes
app.use('/students', studentRoutes);
app.use('/attendance', attendanceRoutes);

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
