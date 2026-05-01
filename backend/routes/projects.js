const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');

const isAdmin = (project, userId) =>
  project.members.some(m => m.user.toString() === userId.toString() && m.role === 'Admin');

// GET /api/projects — list all projects user is part of
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('creator', 'name email')
      .populate('members.user', 'name email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects — create project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = await Project.create({
      name,
      description,
      creator: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }]
    });
    await project.populate('members.user', 'name email');
    await project.populate('creator', 'name email');
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('members.user', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/projects/:id — update name/description (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isAdmin(project, req.user._id)) return res.status(403).json({ message: 'Admins only' });

    const { name, description } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    await project.save();
    await project.populate('members.user', 'name email');
    await project.populate('creator', 'name email');
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isAdmin(project, req.user._id)) return res.status(403).json({ message: 'Admins only' });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects/:id/members — add member by email (Admin only)
router.post('/:id/members', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isAdmin(project, req.user._id)) return res.status(403).json({ message: 'Admins only' });

    const { email, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyMember = project.members.some(m => m.user.toString() === user._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User already a member' });

    project.members.push({ user: user._id, role: role || 'Member' });
    await project.save();
    await project.populate('members.user', 'name email');
    await project.populate('creator', 'name email');
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/projects/:id/members/:userId — remove member (Admin only)
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isAdmin(project, req.user._id)) return res.status(403).json({ message: 'Admins only' });

    if (req.params.userId === project.creator.toString())
      return res.status(400).json({ message: 'Cannot remove project creator' });

    project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
    await project.save();
    await project.populate('members.user', 'name email');
    await project.populate('creator', 'name email');
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/projects/:id/members/:userId/role — change role (Admin only)
router.put('/:id/members/:userId/role', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isAdmin(project, req.user._id)) return res.status(403).json({ message: 'Admins only' });

    const member = project.members.find(m => m.user.toString() === req.params.userId);
    if (!member) return res.status(404).json({ message: 'Member not found' });

    member.role = req.body.role || 'Member';
    await project.save();
    await project.populate('members.user', 'name email');
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
