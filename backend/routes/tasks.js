const express = require('express');
const passport = require('passport');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

const router = express.Router();

// Middleware to authenticate
const authenticate = passport.authenticate('jwt', { session: false });

// Get all tasks
router.get('/', authenticate, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        { model: require('../models/User'), as: 'assignedTo', attributes: ['name'] },
        { model: require('../models/User'), as: 'createdBy', attributes: ['name'] },
      ],
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, priority, deadline, assignedToId, teamId } = req.body;
    const task = await Task.create({
      title,
      description,
      priority,
      deadline,
      assignedToId,
      createdById: req.user.id,
      teamId,
    });

    // Notification
    if (assignedToId) {
      await Notification.create({
        message: `You have been assigned a new task: ${title}`,
        type: 'task_assigned',
        userId: assignedToId,
        taskId: task.id,
      });
    }

    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { status, priority, deadline, assignedToId } = req.body;
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await task.update({ status, priority, deadline, assignedToId });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get comments for a task
router.get('/:id/comments', authenticate, async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { taskId: req.params.id },
      include: [{ model: require('../models/User'), attributes: ['name'] }],
      order: [['createdAt', 'ASC']],
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.create({
      content,
      taskId: req.params.id,
      userId: req.user.id,
    });

    // Notification
    const task = await Task.findByPk(req.params.id);
    if (task.assignedToId && task.assignedToId !== req.user.id) {
      await Notification.create({
        message: `New comment on task: ${task.title}`,
        type: 'comment_added',
        userId: task.assignedToId,
        taskId: task.id,
      });
    }

    res.json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;