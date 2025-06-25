const express = require('express');
const auth = require('../middleware/auth');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');

const router = express.Router();

router.post('/', auth, createProject);
router.get('/', auth, getProjects);
router.get('/:id', auth, getProjectById);
router.put('/:id', auth, updateProject);
router.delete('/:id', auth, deleteProject);

module.exports = router;
