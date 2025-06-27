const express = require('express');
const connectDB = require('./config/db');
require('./cron/repeatingTasks');
const startReminderJob = require('./jobs/reminderJob');
const dotenv = require('dotenv');
const app = express();
const captureRoutes = require('./routes/capture');

dotenv.config();
connectDB();
startReminderJob();

app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/uploads', express.static('uploads'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/capture', captureRoutes);
app.listen(process.env.PORT, () => console.log('Server started'));
