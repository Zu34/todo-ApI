const Task = require('../models/Task');
const { Parser } = require('json2csv'); 
const { createEvents } = require('ics');



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
    // After task update is saved
if (updatedTask.goal) {
  const goalTasks = await Task.find({ goal: updatedTask.goal });
  const allCompleted = goalTasks.every(t => t.status === 'completed');

  if (allCompleted) {
    await Goal.findByIdAndUpdate(updatedTask.goal, { status: 'completed' });
  } else {
    await Goal.findByIdAndUpdate(updatedTask.goal, { status: 'active' });
  }
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
exports.getTasksGroupedByGoal = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.id })
      .populate('goal', 'title')
      .sort({ createdAt: -1 });

    const grouped = {};

    tasks.forEach(task => {
      const goalTitle = task.goal?.title || 'Unassigned';
      if (!grouped[goalTitle]) {
        grouped[goalTitle] = [];
      }
      grouped[goalTitle].push(task);
    });

    res.json(grouped);
  } catch (err) {
    next(err);
  }
};

exports.exportTasksByGoal = async (req, res, next) => {
  try {
    const format = req.query.format || 'json';
    const tasks = await Task.find({ user: req.user.id })
      .populate('goal', 'title')
      .sort({ createdAt: 1 });

    // Group tasks by goal title
    const grouped = {};
    tasks.forEach(task => {
      const goalTitle = task.goal?.title || 'Unassigned';
      if (!grouped[goalTitle]) {
        grouped[goalTitle] = [];
      }

      grouped[goalTitle].push({
        id: task._id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        createdAt: task.createdAt
      });
    });

    // If JSON requested
    if (format === 'json') {
      return res.json(grouped);
    }

    // If CSV requested
    const csvRows = [];
    for (const [goalTitle, tasks] of Object.entries(grouped)) {
      tasks.forEach(task => {
        csvRows.push({
          Goal: goalTitle,
          Title: task.title,
          Status: task.status,
          Priority: task.priority,
          DueDate: task.dueDate,
          CreatedAt: task.createdAt
        });
      });
    }

    const parser = new Parser();
    const csv = parser.parse(csvRows);

    res.header('Content-Type', 'text/csv');
    res.attachment('tasks_export.csv');
    return res.send(csv);
  } catch (err) {
    next(err);
  }
};

exports.exportCalendarICS = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    const query = {
      user: req.user.id,
      dueDate: { $ne: null }
    };

    if (fromDate || toDate) {
      query.dueDate = {};
      if (fromDate) query.dueDate.$gte = new Date(fromDate);
      if (toDate) query.dueDate.$lte = new Date(toDate);
    }

    const tasks = await Task.find(query).sort({ dueDate: 1 });

    const events = tasks.map(task => {
      const due = new Date(task.dueDate);
      return {
        start: [
          due.getFullYear(),
          due.getMonth() + 1,
          due.getDate(),
          due.getHours(),
          due.getMinutes()
        ],
        duration: { hours: 1 },
        title: task.title,
        description: task.description || '',
        status: task.status === 'completed' ? 'CONFIRMED' : 'TENTATIVE'
      };
    });

    const { error, value } = createEvents(events);
    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to generate calendar' });
    }

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.ics');
    res.send(value);
  } catch (err) {
    next(err);
  }
};
