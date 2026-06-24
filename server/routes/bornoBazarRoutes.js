const express = require('express');
const router = express.Router({ mergeParams: true });
const BornoBazarProgress = require('../models/BornoBazarProgress');
const mongoose = require('mongoose');

// GET /api/borno-bazar/:userId — get BornoBazar progress for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    const progress = await BornoBazarProgress.findOne({ userId });
    if (!progress) {
      return res.status(404).json({ error: 'No BornoBazar progress found' });
    }

    res.json(progress);
  } catch (err) {
    console.error('Error fetching BornoBazar progress:', err);
    res.status(500).json({ error: 'Failed to fetch BornoBazar progress' });
  }
});

// POST /api/borno-bazar/:userId — create BornoBazar progress record
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    const progress = await BornoBazarProgress.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(progress);
  } catch (err) {
    console.error('Error creating BornoBazar progress:', err);
    res.status(500).json({ error: 'Failed to create BornoBazar progress' });
  }
});

// PATCH /api/borno-bazar/:userId — update BornoBazar progress
router.patch('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { letter, phaseCompleted, starsEarned } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    const updateOps = {
      $set: { lastSessionAt: new Date() },
      $inc: { totalStars: starsEarned || 0 },
    };

    // Track letter learned (phase 1 = tracing a letter)
    if (phaseCompleted === 1 && letter) {
      updateOps.$addToSet = { lettersLearned: letter };
    }

    // Track word spelled (phase 2)
    if (phaseCompleted === 2 && letter) {
      updateOps.$addToSet = { ...updateOps.$addToSet, wordsSpelled: letter };
    }

    // Track conversation (phase 3)
    if (phaseCompleted === 3) {
      updateOps.$inc = { ...updateOps.$inc, conversationsCompleted: 1, customersServed: 1 };
    }

    const progress = await BornoBazarProgress.findOneAndUpdate(
      { userId },
      updateOps,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(progress);
  } catch (err) {
    console.error('Error updating BornoBazar progress:', err);
    res.status(500).json({ error: 'Failed to update BornoBazar progress' });
  }
});

module.exports = router;
