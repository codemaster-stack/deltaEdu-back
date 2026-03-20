const Course = require('../models/Course');

// GET /api/v1/lms/courses — public
const getCourses = async (req, res, next) => {
  try {
    const { level, search } = req.query;
    const filter = { status: 'published' };
    if (level)  filter.level = level;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const courses = await Course.find(filter).sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/lms/courses/all — all courses including drafts (protected)
const getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/lms/courses/:id
const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.json({ course });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/lms/courses — create course (protected)
const createCourse = async (req, res, next) => {
  try {
    const { title, subject, class: cls, level, levelLabel, teacher, desc, icon, colour, duration, status } = req.body;

    if (!title || !level) {
      return res.status(400).json({ message: 'Title and level are required.' });
    }

    const course = await Course.create({
      title, subject, class: cls, level, levelLabel,
      teacher, desc, icon, colour, duration, status,
      modules:   [],
      createdBy: req.user.id,
    });

    res.status(201).json({ course });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/lms/courses/:id — update course (protected)
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.json({ course });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/lms/courses/:id — delete course (protected)
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    res.json({ message: 'Course deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/lms/courses/:id/modules — add module with lessons (protected)
const addModule = async (req, res, next) => {
  try {
    const { title, lessons } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Module title is required.' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    course.modules.push({ title, lessons: lessons || [] });
    await course.save();

    res.json({ course });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCourses, getAllCourses, getCourse, createCourse, updateCourse, deleteCourse, addModule };