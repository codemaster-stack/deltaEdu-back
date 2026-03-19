const Teacher = require('../models/Teacher');

// GET /api/v1/teachers
const getTeachers = async (req, res, next) => {
  try {
    const { lga, subject, level, status, gender, search } = req.query;

    const filter = {};
    if (lga)    filter.lga    = lga;
    if (level)  filter.level  = level;
    if (status) filter.status = status;
    if (gender) filter.gender = gender;
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (search)  filter.name   = { $regex: search,  $options: 'i' };

    const teachers = await Teacher.find(filter).sort({ name: 1 });
    res.json({ teachers });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/teachers/:id
const getTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ teacher });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/teachers
const createTeacher = async (req, res, next) => {
  try {
    const { name, gender, subject, school, lga, level, status, years, phone } = req.body;

    if (!name || !gender || !subject || !school || !lga || !level) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const teacher = await Teacher.create({ name, gender, subject, school, lga, level, status, years, phone });
    res.status(201).json({ teacher });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/teachers/:id
const updateTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ teacher });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/teachers/:id
const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ message: 'Teacher deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher };