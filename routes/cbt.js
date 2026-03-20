const express = require('express');
const router  = express.Router();
const {
  getExams, getExam, createExam, updateExam, deleteExam,
  verifyExam, submitExam,
} = require('../controllers/cbtController');
const { protect, authorize } = require('../middleware/auth');

router.get('/exams',        protect, authorize('ministry_admin', 'staff'), getExams);
router.get('/exams/:id',    protect, authorize('ministry_admin', 'staff'), getExam);
router.post('/exams',       protect, authorize('ministry_admin', 'staff'), createExam);
router.patch('/exams/:id',  protect, authorize('ministry_admin', 'staff'), updateExam);
router.delete('/exams/:id', protect, authorize('ministry_admin'), deleteExam);
router.post('/verify',      verifyExam);
router.post('/submit',      submitExam);

router.get('/published', async (req, res, next) => {
  try {
    const Exam  = require('../models/Exam');
    const exams = await Exam.find({ status: 'published' })
      .select('-questions.answer -token')
      .sort({ createdAt: -1 });
    res.json({ exams });
  } catch (err) {
    next(err);
  }
});

module.exports = router;