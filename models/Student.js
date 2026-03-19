const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },
  dob: {
    type: Date,
  },
  class: {
    type: String,
    trim: true,
  },
  level: {
    type: String,
    enum: ['primary', 'secondary'],
    required: true,
  },
  school: {
    type: String,
    trim: true,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    default: null,
  },
  lga: {
    type: String,
    trim: true,
  },
  guardian: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'graduated', 'withdrawn', 'transferred'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);