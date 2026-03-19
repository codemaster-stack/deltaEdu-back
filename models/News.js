const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  excerpt: {
    type: String,
    trim: true,
  },
  content: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    enum: ['Examination', 'Infrastructure', 'Training', 'Results', 'Technology', 'Policy', 'Circular'],
    required: [true, 'Category is required'],
  },
  audience: {
    type: String,
    enum: ['all', 'teachers', 'students', 'principals'],
    default: 'all',
  },
  icon: {
    type: String,
    default: '📢',
  },
  colour: {
    type: String,
    default: 'gold',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);