const express = require('express');
const passport = require('passport');
const Team = require('../models/Team');
const User = require('../models/User');

const router = express.Router();

const authenticate = passport.authenticate('jwt', { session: false });

// Get all teams
router.get('/', authenticate, async (req, res) => {
  try {
    const teams = await Team.findAll({
      include: [{ model: User, as: 'createdBy', attributes: ['name'] }],
    });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create team
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    const team = await Team.create({
      name,
      description,
      createdById: req.user.id,
    });
    res.json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get team by id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: [{ model: User, as: 'createdBy', attributes: ['name'] }],
    });
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update team
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    await team.update({ name, description });
    res.json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete team
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    await team.destroy();
    res.json({ message: 'Team deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;