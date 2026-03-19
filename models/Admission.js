const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  ref: {
    type: String,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
  },
  dob: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
  },
  class: {
    type: String,
    required: [true, 'Class is required'],
    trim: true,
  },
  school: {
    type: String,
    required: [true, 'School is required'],
    trim: true,
  },
  lga: {
    type: String,
    required: [true, 'LGA is required'],
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
    enum: ['pending', 'approved', 'waitlisted', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

// Auto-generate ref before saving
admissionSchema.pre('save', async function() {
  if (!this.ref) {
    const year  = new Date().getFullYear();
    const count = await mongoose.model('Admission').countDocuments();
    this.ref    = `ADM-${year}-${String(count + 1).padStart(6, '0')}`;
  }
});

module.exports = mongoose.model('Admission', admissionSchema);