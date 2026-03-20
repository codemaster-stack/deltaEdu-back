const Exam = require('../models/Exam');

// GET /api/v1/cbt/exams — list all exams (protected)
const getExams = async (req, res, next) => {
  try {
    const exams = await Exam.find()
      .select('-questions.answer') // don't expose answers
      .sort({ createdAt: -1 });
    res.json({ exams });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/cbt/exams/:id — get single exam (protected)
const getExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });
    res.json({ exam });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/cbt/exams — create exam (protected)
const createExam = async (req, res, next) => {
  try {
    const { code, title, subject, class: cls, duration, token, questions } = req.body;

    if (!code || !title || !subject || !cls || !duration || !token) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const exam = await Exam.create({
      code, title, subject,
      class: cls, duration, token,
      questions: questions || [],
      createdBy: req.user.id,
    });

    res.status(201).json({ exam });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/cbt/exams/:id — update exam (protected)
const updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });
    res.json({ exam });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/cbt/exams/:id — delete exam (protected)
const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });
    res.json({ message: 'Exam deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/cbt/verify — student verifies exam access (public)
const verifyExam = async (req, res, next) => {
  try {
    const { studentId, examCode, token } = req.body;

    if (!studentId || !examCode || !token) {
      return res.status(400).json({ message: 'Student ID, exam code and token are required.' });
    }

    const exam = await Exam.findOne({
      code:   examCode.toUpperCase(),
      token,
      status: 'published',
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or access token is invalid.' });
    }

    res.json({ exam });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/cbt/submit — student submits exam (public)
const submitExam = async (req, res, next) => {
  try {
    const { examId, studentId, answers } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found.' });

    let correct = 0;
    exam.questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });

    const total   = exam.questions.length;
    const score   = Math.round((correct / total) * 100);

    res.json({ score, correct, wrong: total - correct - (total - Object.keys(answers).length), skipped: total - Object.keys(answers).length, total });
  } catch (err) {
    next(err);
  }
};

module.exports = { getExams, getExam, createExam, updateExam, deleteExam, verifyExam, submitExam };