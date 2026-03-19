const express = require('express');
const router  = express.Router();
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect } = require('../middleware/auth');

router.get('/',    protect, getStudents);
router.get('/:id', protect, getStudent);
router.post('/',   protect, createStudent);
router.patch('/:id', protect, updateStudent);
router.delete('/:id', protect, deleteStudent);

module.exports = router;