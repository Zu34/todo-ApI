const cron = require('node-cron');
const Task = require('../models/Task');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       // e.g. "yourapp@gmail.com"
    pass: process.env.EMAIL_PASSWORD
  }
});

function startReminderJob() {
  // Run daily at 8AM server time
  cron.schedule('0 8 * * *', async () => {
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const tasks = await Task.find({
      dueDate: { $gte: now, $lte: next24h },
      status: 'pending'
    }).populate('user', 'email username');

    for (const task of tasks) {
      const user = task.user;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `⏰ Reminder: "${task.title}" is due soon`,
        text: `Hey ${user.username},\n\nYour task "${task.title}" is due on ${task.dueDate.toDateString()}.\n\nStay focused!`,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Sent reminder to ${user.email} for task "${task.title}"`);
      } catch (err) {
        console.error(`❌ Failed to send reminder to ${user.email}:`, err);
      }
    }
  });
}

module.exports = startReminderJob;
