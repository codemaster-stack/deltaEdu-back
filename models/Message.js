const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    required: true,
  },
  to: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
  }],
  subject: {
    type:    String,
    required: true,
    trim:    true,
  },
  body: {
    type:    String,
    required: true,
    trim:    true,
  },
  audience: {
    type: String,
    enum: ['individual', 'all', 'teachers', 'students', 'principals'],
    default: 'individual',
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
  }],
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'Message',
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);