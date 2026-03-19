const Result = require('../models/Result');

// GET /api/v1/results — manage records (protected)
const getResults = async (req, res, next) => {
  try {
    const { studentId, exam, class: cls, search } = req.query;

    const filter = {};
    if (studentId) filter.studentId = { $regex: studentId, $options: 'i' };
    if (exam)      filter.exam      = exam;
    if (cls)       filter.class     = cls;
    if (search) {
      filter.$or = [
        { name:      { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const results = await Result.find(filter).sort({ createdAt: -1 });
    res.json({ results });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/results/check — check result by studentId + exam + pin (public)
const checkResult = async (req, res, next) => {
  try {
    const { studentId, exam, pin } = req.body;

    if (!studentId || !exam || !pin) {
      return res.status(400).json({ message: 'Student ID, examination and PIN are required.' });
    }

    const result = await Result.findOne({
      studentId: studentId.toUpperCase(),
      exam,
      pin,
    });

    if (!result) {
      return res.status(404).json({ message: 'No result found. Please check your Student ID, examination and PIN.' });
    }

    res.json({ result });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/results — create single result (protected)
const createResult = async (req, res, next) => {
  try {
    const result = await Result.create({ ...req.body, uploadedBy: req.user.id });
    res.status(201).json({ result });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/results/upload — bulk upload (protected)
const uploadResults = async (req, res, next) => {
  try {
    const { results } = req.body;

    if (!results || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of results.' });
    }

    const docs = results.map(r => ({ ...r, uploadedBy: req.user.id }));
    await Result.insertMany(docs, { ordered: false });

    res.status(201).json({ message: `${results.length} results uploaded successfully.` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getResults, checkResult, createResult, uploadResults };