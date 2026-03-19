const express = require('express');
const router  = express.Router();
const { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher } = require('../controllers/teacherController');
const { protect } = require('../middleware/auth');

router.get('/',    protect, getTeachers);
router.get('/:id', protect, getTeacher);
router.post('/',   protect, createTeacher);
router.patch('/:id', protect, updateTeacher);
router.delete('/:id', protect, deleteTeacher);

module.exports = router;