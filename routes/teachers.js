const express = require('express');
const router  = express.Router();
const { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher } = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');

router.get('/',      protect, getTeachers);
router.get('/:id',   protect, getTeacher);
router.post('/',     protect, authorize('ministry_admin', 'staff'), createTeacher);
router.patch('/:id', protect, authorize('ministry_admin', 'staff'), updateTeacher);
router.delete('/:id',protect, authorize('ministry_admin'), deleteTeacher);

module.exports = router;