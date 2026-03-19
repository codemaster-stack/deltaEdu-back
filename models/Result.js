const mongoose = require('mongoose');

const subjectResultSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  ca:    { type: Number, required: true, min: 0, max: 30  },
  exam:  { type: Number, required: true, min: 0, max: 70  },
  total: { type: Number, required: true, min: 0, max: 100 },
}, { _id: false });

const resultSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    trim: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  class: {
    type: String,
    required: true,
    trim: true,
  },
  school: {
    type: String,
    required: true,
    trim: true,
  },
  session: {
    type: String,
    required: true,
    trim: true,
  },
  term: {
    type: String,
    enum: ['First Term', 'Second Term', 'Third Term'],
    required: true,
  },
  exam: {
    type: String,
    required: true,
    trim: true,
  },
  pin: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  remark: {
    type: String,
    trim: true,
  },
  subjects: [subjectResultSchema],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);