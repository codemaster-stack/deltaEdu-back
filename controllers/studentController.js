const Student = require('../models/Student');

// GET /api/v1/students
const getStudents = async (req, res, next) => {
  try {
    const { lga, class: cls, level, status, gender, search } = req.query;

    const filter = {};
    if (lga)    filter.lga    = lga;
    if (cls)    filter.class  = cls;
    if (level)  filter.level  = level;
    if (status) filter.status = status;
    if (gender) filter.gender = gender;
    if (search) {
      filter.$or = [
        { name:      { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter).sort({ name: 1 });
    res.json({ students });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/students/:id
const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ student });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/students
const createStudent = async (req, res, next) => {
  try {
    const { studentId, name, gender, dob, class: cls, level, school, lga, guardian, phone, status } = req.body;

    if (!name || !gender || !cls || !level || !school || !lga) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Auto-generate studentId if not provided
    const id = studentId || await generateStudentId();

    const student = await Student.create({
      studentId: id, name, gender, dob, class: cls,
      level, school, lga, guardian, phone, status,
    });
    res.status(201).json({ student });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/students/:id
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ student });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/students/:id
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Helper — auto generate student ID
async function generateStudentId() {
  const year  = new Date().getFullYear();
  const count = await Student.countDocuments();
  const padded = String(count + 1).padStart(6, '0');
  return `DSS/${year}/${padded}`;
}

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent };