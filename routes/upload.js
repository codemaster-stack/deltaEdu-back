const express = require('express');
const router  = express.Router();
const { uploadLessonVideo, deleteLessonVideo } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/auth');

router.post('/video',         protect, authorize('ministry_admin', 'staff'), uploadLessonVideo);
router.delete('/video/:publicId', protect, authorize('ministry_admin'), deleteLessonVideo);

module.exports = router;