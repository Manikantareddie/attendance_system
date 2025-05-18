// backend/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Manikanta@123', // <-- Put your MySQL password here
  database: 'attendance_system' // <-- Make sure you create this DB later
});

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection error:', err);
    return;
  }
  console.log('✅ MySQL Connected');
});

module.exports = db;
