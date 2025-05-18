const express = require('express');
const router = express.Router();
const db = require('../db'); // your MySQL connection module

router.get('/', (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) {
      console.error('DB error fetching students:', err);
      return res.status(500).json({ error: 'Failed to fetch students' });
    }
    res.json(results);
  });
});
router.post('/', (req, res) => {
  const { name, roll_number, class: className } = req.body;

  if (!name || !roll_number || !className) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = 'INSERT INTO students (name, roll_number, class) VALUES (?, ?, ?)';
  db.query(query, [name, roll_number, className], (err, result) => {
    if (err) {
      console.error('DB error inserting student:', err);
      return res.status(500).json({ error: 'Failed to add student' });
    }
    res.status(201).json({ message: 'Student added successfully', studentId: result.insertId });
  });
});
// Delete a student by ID
router.delete('/:id', (req, res) => {
  const studentId = req.params.id;

  // Step 1: Delete attendance records for the student
  const deleteAttendanceQuery = 'DELETE FROM attendance WHERE student_id = ?';
  db.query(deleteAttendanceQuery, [studentId], (err) => {
    if (err) {
      console.error('DB error deleting attendance records:', err);
      return res.status(500).json({ error: 'Failed to delete attendance records' });
    }

    // Step 2: Delete the student
    const deleteStudentQuery = 'DELETE FROM students WHERE id = ?';
    db.query(deleteStudentQuery, [studentId], (err2) => {
      if (err2) {
        console.error('DB error deleting student:', err2);
        return res.status(500).json({ error: 'Failed to delete student' });
      }
      res.json({ message: 'Student deleted successfully' });
    });
  });
});



module.exports = router;
