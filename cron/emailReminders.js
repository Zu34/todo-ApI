const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

cron.schedule('*/30 * * * *', async () => {
  const now = new Date();
  const soon = new Date(now.getTime() + 60 * 60 * 1000); // next hour

  const tasks = await Task.find({
    dueDate: { $lte: soon, $gte: now },
    status: 'pending'
  }).populate('user');

  for (const task of tasks) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: task.user.email,
      subject: `⏰ Task Reminder: "${task.title}"`,
      text: `Your task "${task.title}" is due by ${task.dueDate.toLocaleString()}.`
    });

    console.log(`📩 Reminder sent to ${task.user.email}`);
  }
});
