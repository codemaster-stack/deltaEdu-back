const express = require('express');
const router  = express.Router();
const {
  getCourses, getAllCourses, getCourse,
  createCourse, updateCourse, deleteCourse, addModule,
} = require('../controllers/lmsController');
const { protect, authorize } = require('../middleware/auth');
const { getCourses, getAllCourses, getCourse, createCourse, updateCourse, deleteCourse, addModule, addComment, replyComment, getComments } = require('../controllers/lmsController');

router.get('/courses',         getCourses);
router.get('/courses/all',     protect, authorize('ministry_admin', 'staff'), getAllCourses);
router.get('/courses/:id',     getCourse);
router.post('/courses',        protect, authorize('ministry_admin', 'staff'), createCourse);
router.patch('/courses/:id',   protect, authorize('ministry_admin', 'staff'), updateCourse);
router.delete('/courses/:id',  protect, authorize('ministry_admin'), deleteCourse);
router.post('/courses/:id/modules', protect, authorize('ministry_admin', 'staff'), addModule);

router.get('/courses/:id/lessons/:lessonId/comments',                    getComments);
router.post('/courses/:id/lessons/:lessonId/comments',                   addComment);
router.post('/courses/:id/lessons/:lessonId/comments/:commentId/reply',  protect, authorize('ministry_admin', 'staff'), replyComment);

module.exports = router;