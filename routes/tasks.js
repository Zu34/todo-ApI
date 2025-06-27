const express = require('express');
const auth = require('../middleware/auth');
const { exportCalendarICS } = require('../controllers/taskController');

const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const router = express.Router();
router.get('/unassigned', auth, getUnassignedTasks);
router.get('/by-goal', auth, getTasksGroupedByGoal);
router.get('/export.ics', auth, exportCalendarICS);
router.post('/', auth, createTask);
router.get('/', auth, getTasks);
router.get('/:id', auth, getTaskById);
router.put('/:id', auth, updateTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;
