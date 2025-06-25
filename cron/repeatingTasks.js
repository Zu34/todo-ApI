const cron = require('node-cron');
const Task = require('../models/Task');

function getNextDueDate(current, repeat) {
  const next = new Date(current);
  if (repeat === 'daily') next.setDate(next.getDate() + 1);
  if (repeat === 'weekly') next.setDate(next.getDate() + 7);
  if (repeat === 'monthly') next.setMonth(next.getMonth() + 1);
  return next;
}

cron.schedule('0 1 * * *', async () => {
  const repeating = await Task.find({ repeat: { $ne: 'none' }, status: 'completed' });

  for (const task of repeating) {
    const clone = new Task({
      ...task.toObject(),
      _id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      status: 'pending',
      dueDate: getNextDueDate(task.dueDate || new Date(), task.repeat)
    });
    await clone.save();
    console.log(`🔁 Repeated task "${task.title}" created.`);
  }
});
