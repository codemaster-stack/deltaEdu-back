const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'School name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['primary', 'secondary'],
    required: [true, 'School type is required'],
  },
  lga: {
    type: String,
    required: [true, 'LGA is required'],
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  principal: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  students: {
    type: Number,
    default: 0,
  },
  teachers: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('School', schoolSchema);