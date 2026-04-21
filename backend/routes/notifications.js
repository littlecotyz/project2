const express = require('express');
const passport = require('passport');
const Notification = require('../models/Notification');

const router = express.Router();

const authenticate = passport.authenticate('jwt', { session: false });

// Get notifications for user
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.update({ read: true });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification || notification.userId !== req.user.id) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.destroy();
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;