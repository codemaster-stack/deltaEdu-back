const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  type:     { type: String, enum: ['video', 'reading'], default: 'reading' },
  duration: { type: String, default: '30 min' },
  content:  { type: String, trim: true },
  videoUrl: { type: String, trim: true },
  keyPoints:   [{ type: String }],
  assignment:  { type: String, trim: true },
}, { _id: true });

const moduleSchema = new mongoose.Schema({
  title:   { type: String, required: true, trim: true },
  lessons: [lessonSchema],
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: {
    type:     String,
    required: [true, 'Course title is required'],
    trim:     true,
  },
  subject: {
    type:  String,
    trim:  true,
  },
  class: {
    type:  String,
    trim:  true,
  },
  level: {
    type: String,
    enum: ['primary', 'junior-secondary', 'senior-secondary'],
    required: true,
  },
  levelLabel: {
    type: String,
    trim: true,
  },
  teacher: {
    type:    String,
    trim:    true,
    default: 'Ministry of Education',
  },
  desc: {
    type:  String,
    trim:  true,
  },
  icon:     { type: String, default: '📚' },
  colour:   { type: String, default: '#1A6B4A' },
  duration: { type: String, default: '2h 00m' },
  enrolled: { type: Boolean, default: false },
  status: {
    type:    String,
    enum:    ['draft', 'published'],
    default: 'draft',
  },
  modules: [moduleSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);