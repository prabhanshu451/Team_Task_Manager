const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// GET /api/dashboard?projectId=xxx
router.get('/', auth, async (req, res) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ message: 'projectId is required' });

    const project = await Project.findById(projectId).populate('members.user', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const role = project.members.find(m => m.user._id.toString() === req.user._id.toString())?.role;

    let taskQuery = { project: projectId };
    if (role === 'Member') taskQuery.assignedTo = req.user._id;

    const tasks = await Task.find(taskQuery).populate('assignedTo', 'name email');

    const now = new Date();
    const stats = {
      total: tasks.length,
      byStatus: {
        'To Do': tasks.filter(t => t.status === 'To Do').length,
        'In Progress': tasks.filter(t => t.status === 'In Progress').length,
        'Done': tasks.filter(t => t.status === 'Done').length,
      },
      overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done').length,
      byPriority: {
        Low: tasks.filter(t => t.priority === 'Low').length,
        Medium: tasks.filter(t => t.priority === 'Medium').length,
        High: tasks.filter(t => t.priority === 'High').length,
      },
      byUser: {}
    };

    // Tasks per user (Admin only)
    if (role === 'Admin') {
      tasks.forEach(task => {
        if (task.assignedTo) {
          const name = task.assignedTo.name;
          stats.byUser[name] = (stats.byUser[name] || 0) + 1;
        } else {
          stats.byUser['Unassigned'] = (stats.byUser['Unassigned'] || 0) + 1;
        }
      });
    }

    res.json({ stats, role, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
