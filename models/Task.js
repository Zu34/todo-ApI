// models/task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    tags: [{
      type: String,
      trim: true,
    }],
    repeat: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    sharedWith: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    attachments: [{
      type: String, // file paths or URLs
    }],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    goal: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Goal',
  default: null
},
reminderSent: {
  type: Boolean,
  default: false
},
    history: [{
  previous: Object,
  updatedAt: Date,
  by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}],
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

TaskSchema.index({ title: 'text', description: 'text' });

TaskSchema.pre('findOneAndUpdate', async function (next) {
  const taskBefore = await this.model.findOne(this.getQuery());

  if (taskBefore) {
    await this.model.updateOne(
      this.getQuery(),
      {
        $push: {
          history: {
            previous: taskBefore.toObject(),
            updatedAt: new Date(),
            by: this.options.userId || null
          }
        }
      }
    );
  }

  next();
});
TaskSchema.pre('save', function (next) {
  if (this.isModified('dueDate') || this.isModified('status')) {
    this.reminderSent = false;
  }
  next();
});
module.exports = mongoose.model('Task', TaskSchema);