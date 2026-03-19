const express = require('express');
const router  = express.Router();
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',      protect, getStudents);
router.get('/:id',   protect, getStudent);
router.post('/',     protect, authorize('ministry_admin', 'staff'), createStudent);
router.patch('/:id', protect, authorize('ministry_admin', 'staff'), updateStudent);
router.delete('/:id',protect, authorize('ministry_admin'), deleteStudent);

module.exports = router;