const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const getMemberRole = (project, userId) => {
  const m = project.members.find(m => m.user.toString() === userId.toString());
  return m ? m.role : null;
};

// GET /api/tasks?projectId=xxx
router.get('/', auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ message: 'projectId is required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const role = getMemberRole(project, req.user._id);
    if (!role) return res.status(403).json({ message: 'Access denied' });

    let query = { project: projectId };
    // Members only see their assigned tasks
    if (role === 'Member') query.assignedTo = req.user._id;

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks — create task (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, projectId, assignedTo } = req.body;
    if (!title || !projectId) return res.status(400).json({ message: 'Title and projectId required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const role = getMemberRole(project, req.user._id);
    if (role !== 'Admin') return res.status(403).json({ message: 'Admins only' });

    // Validate assignee is a project member
    if (assignedTo) {
      const isMember = project.members.some(m => m.user.toString() === assignedTo);
      if (!isMember) return res.status(400).json({ message: 'Assignee must be a project member' });
    }

    const task = await Task.create({
      title, description, dueDate, priority,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id
    });
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tasks/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    const role = getMemberRole(project, req.user._id);
    if (!role) return res.status(403).json({ message: 'Access denied' });

    if (role === 'Member' && task.assignedTo?._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tasks/:id — update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    const role = getMemberRole(project, req.user._id);
    if (!role) return res.status(403).json({ message: 'Access denied' });

    if (role === 'Admin') {
      // Admin can update everything
      const { title, description, dueDate, priority, status, assignedTo } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (dueDate !== undefined) task.dueDate = dueDate;
      if (priority) task.priority = priority;
      if (status) task.status = status;
      if (assignedTo !== undefined) {
        if (assignedTo) {
          const isMember = project.members.some(m => m.user.toString() === assignedTo);
          if (!isMember) return res.status(400).json({ message: 'Assignee must be a project member' });
        }
        task.assignedTo = assignedTo || null;
      }
    } else {
      // Member can only update status of their own tasks
      if (task.assignedTo?.toString() !== req.user._id.toString())
        return res.status(403).json({ message: 'Access denied' });
      if (req.body.status) task.status = req.body.status;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    const role = getMemberRole(project, req.user._id);
    if (role !== 'Admin') return res.status(403).json({ message: 'Admins only' });

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
