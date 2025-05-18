// backend/routes/attendance.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Record attendance (bulk insert) — now listens on /mark
router.post('/mark', (req, res) => {
  const attendanceRecords = req.body; // Expecting an array of { student_id, date, status }

  if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
    return res.status(400).json({ error: 'Invalid attendance data' });
  }

  const values = attendanceRecords.map(r => [r.student_id, r.date, r.status]);

  const sql = 'INSERT INTO attendance (student_id, date, status) VALUES ?';

  db.query(sql, [values], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Attendance recorded' });
  });
});

// (Optional) Keep GET '/' as is for fetching attendance reports
router.get('/', (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  const sql = `
    SELECT 
      s.id AS student_id, 
      s.name, 
      s.roll_number, 
      s.class, 
      COALESCE(a.status, 'Not Marked') AS status
    FROM students s
    LEFT JOIN attendance a 
      ON s.id = a.student_id AND a.date = ?
  `;

  db.query(sql, [date], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// GET /attendance/summary/:studentId
router.get('/summary/:studentId', (req, res) => {
  const studentId = req.params.studentId;

  const query = `
    SELECT 
      SUM(status = 'present') AS present_days,
      SUM(status = 'absent') AS absent_days
    FROM attendance
    WHERE student_id = ?
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('DB error fetching summary:', err);
      return res.status(500).json({ error: 'Failed to fetch attendance summary' });
    }

    const data = results[0] || { present_days: 0, absent_days: 0 };
    res.json(data);
  });
});
// GET /attendance/detail/:studentId
router.get('/detail/:studentId', (req, res) => {
  const studentId = req.params.studentId;

  const query = `
    SELECT date, status
    FROM attendance
    WHERE student_id = ?
    ORDER BY date DESC
  `;

  db.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('DB error fetching detailed attendance:', err);
      return res.status(500).json({ error: 'Failed to fetch detailed attendance' });
    }
    res.json(results);
  });
});

// Get all attendance dates for a student
router.get('/dates/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  const query = `SELECT date, status FROM attendance WHERE student_id = ? ORDER BY date`;

  db.query(query, [studentId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch dates' });
    res.json(results);
  });
});

// GET /working-days - Returns total working days set by teacher
router.get('/working-days', (req, res) => {
  const query = `SELECT total_days FROM working_days LIMIT 1`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching working days:', err);
      return res.status(500).json({ error: 'Failed to fetch working days' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Working days not set yet' });
    }

    res.json({ total_days: results[0].total_days });
  });
});


module.exports = router;
