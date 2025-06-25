const Task = require('../models/Task');

exports.createTask = async (req, res, next) => {
  try {
    const task = new Task({ ...req.body, user: req.user.id });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  const filter = { user: req.user.id };

  if (req.query.projectId) filter.project = req.query.projectId;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;

  try {
    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      const error = new Error('Task not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const updated = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },  
      req.body,                                   
      {
        new: true,                                  
        userId: req.user.id                         
      }
    );

    if (!updated) {
      const error = new Error('Task not found or unauthorized');
      error.statusCode = 404;
      return next(error);
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const deleted = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!deleted) {
      const error = new Error('Task not found or unauthorized');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ msg: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
