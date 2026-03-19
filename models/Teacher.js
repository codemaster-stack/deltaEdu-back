const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Teacher name is required'],
    trim: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  school: {
    type: String,
    required: [true, 'School is required'],
    trim: true,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    default: null,
  },
  lga: {
    type: String,
    required: [true, 'LGA is required'],
    trim: true,
  },
  level: {
    type: String,
    enum: ['primary', 'secondary'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'on-leave', 'transferred', 'retired'],
    default: 'active',
  },
  years: {
    type: Number,
    default: 0,
  },
  phone: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);