const Task = require('../models/Task');
const mongoose = require('mongoose');

exports.getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { projectId, fromDate, toDate, lastNDays } = req.query;

    // 🧱 Build base query
    const match = { user: new mongoose.Types.ObjectId(userId) };

    // ✅ Optional project filter
    if (projectId) {
      match.project = new mongoose.Types.ObjectId(projectId);
    }

    // ✅ Optional date filter based on task creation time
    if (lastNDays) {
      const from = new Date();
      from.setDate(from.getDate() - parseInt(lastNDays));
      match.createdAt = { $gte: from };
    } else if (fromDate || toDate) {
      match.createdAt = {};
      if (fromDate) match.createdAt.$gte = new Date(fromDate);
      if (toDate) match.createdAt.$lte = new Date(toDate);
    }

    // 🧮 Count totals
    const totalTasks = await Task.countDocuments(match);
    const completed = await Task.countDocuments({ ...match, status: 'completed' });
    const pending = await Task.countDocuments({ ...match, status: 'pending' });

    // 📌 Priority breakdown
    const priorityCounts = await Task.aggregate([
      { $match: match },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const byPriority = { high: 0, medium: 0, low: 0 };
    priorityCounts.forEach(p => byPriority[p._id] = p.count);

    // 📁 Tasks grouped by project
    const projectCounts = await Task.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$project',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'projectDetails'
        }
      },
      {
        $unwind: {
          path: '$projectDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          projectId: '$_id',
          name: '$projectDetails.name',
          count: 1
        }
      }
    ]);

    // 🗓 Due today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const dueToday = await Task.countDocuments({
      user: userId,
      dueDate: { $gte: startOfToday, $lte: endOfToday }
    });

    // 🗓 Due this week
    const now = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

    const dueThisWeek = await Task.countDocuments({
      user: userId,
      dueDate: { $gte: now, $lte: endOfWeek }
    });

const projects = await Project.find({ user: userId }).lean();

const taskCounts = await Task.aggregate([
  { $match: { user: new mongoose.Types.ObjectId(userId) } },
  {
    $group: {
      _id: {
        project: '$project',
        status: '$status'
      },
      count: { $sum: 1 }
    }
  }
]);

// Organize counts for fast access
const projectStats = {};
taskCounts.forEach(entry => {
  const pid = entry._id.project?.toString() || 'unassigned';
  if (!projectStats[pid]) {
    projectStats[pid] = { total: 0, completed: 0 };
  }
  projectStats[pid].total += entry.count;
  if (entry._id.status === 'completed') {
    projectStats[pid].completed += entry.count;
  }
});

// Build project summaries
const fullProjectList = projects.map(project => {
  const stats = projectStats[project._id.toString()] || { total: 0, completed: 0 };
  const completion = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  return {
    projectId: project._id,
    name: project.name,
    totalTasks: stats.total,
    completedTasks: stats.completed,
    completion
  };
});


    // ✅ Response
  res.json({
  totalTasks,
  completed,
  pending,
  byPriority,
  byProject: projectCounts.map(p => ({
    projectId: p.projectId,
    name: p.name || 'Unassigned',
    total: p.count
  })),
  dueToday,
  dueThisWeek,
  projects: fullProjectList 
});

  } catch (err) {
    next(err);
  }
};
