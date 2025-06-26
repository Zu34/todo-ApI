const Goal = require('../models/Goal');
const Task = require('../models/Task');

// ✅ 1. Create Goal
exports.createGoal = async (req, res, next) => {
  try {
    const { title, description, targetDate, color } = req.body;

    const goal = await Goal.create({
      title,
      description,
      targetDate,
      color,
      user: req.user.id
    });

    res.status(201).json(goal);
  } catch (err) {
    next(err);
  }
};

// ✅ 2. Get All Goals for Current User
exports.getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    next(err);
  }
};

// ✅ 3. Get All Tasks Under a Specific Goal
exports.getGoalTasks = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tasks = await Task.find({
      user: req.user.id,
      goal: id
    }).sort({ dueDate: 1 });

    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

// ✅ 4. Update a Goal
exports.updateGoal = async (req, res, next) => {
  try {
    const updated = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ✅ 5. Delete a Goal
exports.deleteGoal = async (req, res, next) => {
  try {
    const deleted = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    // Optional: Unlink tasks from this goal
    await Task.updateMany({ goal: req.params.id }, { $set: { goal: null } });

    res.json({ message: 'Goal deleted successfully' });
  } catch (err) {
    next(err);
  }
};
