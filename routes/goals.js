const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createGoal,
  getGoals,
  getGoalTasks,
  updateGoal,
  deleteGoal
} = require('../controllers/goalController');

router.post('/', auth, createGoal);
router.get('/', auth, getGoals);
router.get('/:id/tasks', auth, getGoalTasks);
router.put('/:id', auth, updateGoal);
router.delete('/:id', auth, deleteGoal);

module.exports = router;
