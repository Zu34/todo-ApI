const Project = require('../models/Project');

exports.createProject = async (req, res, next) => {
  try {
    const project = new Project({ ...req.body, user: req.user.id });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.user.id });
    res.json(projects);
  } catch (err) {
    next(err);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      return next(error);
    }

    res.json(project);
  } catch (err) {
    next(err);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const updated = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) {
      const error = new Error('Project not found or unauthorized');
      error.statusCode = 404;
      return next(error);
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const deleted = await Project.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!deleted) {
      const error = new Error('Project not found or unauthorized');
      error.statusCode = 404;
      return next(error);
    }

    res.json({ msg: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};
