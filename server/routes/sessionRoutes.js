const express = require('express');
const router = express.Router();
const ActivitySession = require('../models/ActivitySession');
const mongoose = require('mongoose');

// POST /api/sessions — create a new activity session
router.post('/', async (req, res) => {
  try {
    const { userId, clientSessionId, feature, activityType, score, starsEarned, accuracy, durationMs, details } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Validate userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    // Prevent duplicate sessions if clientSessionId is supplied
    if (clientSessionId) {
      const existing = await ActivitySession.findOne({ clientSessionId });
      if (existing) {
        return res.status(200).json(existing);
      }
    }

    const session = await ActivitySession.create({
      userId,
      clientSessionId,
      feature,
      activityType,
      score,
      starsEarned: starsEarned || 0,
      accuracy,
      durationMs,
      details,
    });

    res.status(201).json(session);
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /api/sessions/:userId — get all sessions for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    const sessions = await ActivitySession.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json(sessions);
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

module.exports = router;
