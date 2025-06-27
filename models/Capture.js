const mongoose = require('mongoose');

const CaptureSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['task', 'thought', 'info', 'note', 'blog', 'essay'],
    default: 'thought'
  },
  title: {
    type: String,
    required: function () {
      return ['task', 'blog', 'essay'].includes(this.type);
    },
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Capture', CaptureSchema);
