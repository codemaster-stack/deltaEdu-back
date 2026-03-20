const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  text:    { type: String, required: true, trim: true },
  options: { type: [optionSchema], required: true, validate: v => v.length >= 2 },
  answer:  { type: Number, required: true, min: 0 }, // index of correct option
  marks:   { type: Number, default: 2 },
}, { _id: true });

const examSchema = new mongoose.Schema({
  code: {
    type:     String,
    required: [true, 'Exam code is required'],
    unique:   true,
    uppercase: true,
    trim:     true,
  },
  title: {
    type:     String,
    required: [true, 'Exam title is required'],
    trim:     true,
  },
  subject: {
    type:     String,
    required: true,
    trim:     true,
  },
  class: {
    type:     String,
    required: true,
    trim:     true,
  },
  duration: {
    type:    Number,
    required: true,
    default: 45,
  },
  token: {
    type:     String,
    required: [true, 'Access token is required'],
    trim:     true,
  },
  status: {
    type:    String,
    enum:    ['draft', 'published', 'closed'],
    default: 'draft',
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);