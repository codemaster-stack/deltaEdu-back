const Result = require('../models/Result');
const multer = require('multer');
const XLSX   = require('xlsx');

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

// Multer config — store in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = '.' + file.originalname.split('.').pop().toLowerCase();
    if (['.csv', '.xlsx'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv and .xlsx files are accepted.'));
    }
  },
});

// POST /api/v1/results/upload — bulk upload via file (protected)
const uploadResults = (req, res, next) => {
  upload.single('file')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file.' });
    }

    try {
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheet    = workbook.Sheets[workbook.SheetNames[0]];
      const rows     = XLSX.utils.sheet_to_json(sheet);

      if (!rows.length) {
        return res.status(400).json({ message: 'File is empty or has no valid data.' });
      }

      const { school, lga, class: cls, exam, subject } = req.body;

      if (!school || !cls || !exam || !subject) {
        return res.status(400).json({ message: 'School, class, exam and subject are required.' });
      }

      const results = rows.map(row => ({
        studentId: String(row.student_id || row.studentId || '').toUpperCase().trim(),
        name:      String(row.student_name || row.name || ''),
        class:     cls,
        school,
        session:   '2024/2025',
        term:      exam.includes('3') ? 'Third Term' : exam.includes('2') ? 'Second Term' : 'First Term',
        exam,
        pin:       `PIN${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        subjects: [{
          name:  subject,
          ca:    Number(row.ca_score || row.ca || 0),
          exam:  Number(row.exam_score || row.exam || 0),
          total: Number(row.ca_score || row.ca || 0) + Number(row.exam_score || row.exam || 0),
        }],
        uploadedBy: req.user.id,
      })).filter(r => r.studentId);

      if (!results.length) {
        return res.status(400).json({ message: 'No valid records found. Check column names: student_id, student_name, ca_score, exam_score.' });
      }

      await Result.insertMany(results, { ordered: false });

      res.status(201).json({
        message: `${results.length} results uploaded successfully.`,
        count:   results.length,
      });

    } catch (err) {
      next(err);
    }
  });
};

module.exports = { getResults, checkResult, createResult, uploadResults };