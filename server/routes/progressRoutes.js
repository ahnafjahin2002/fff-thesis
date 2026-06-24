const express = require('express');
const router = express.Router({ mergeParams: true });

const Progress = require('../models/Progress');

router.get('/:userId', async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.params.userId });
    if (!progress) return res.status(404).json({ error: 'Progress not found' });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:userId', async (req, res) => {
  try {
    const progress = new Progress({ ...req.body, userId: req.params.userId });
    await progress.save();
    res.status(201).json(progress);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:userId', async (req, res) => {
  try {
    const progress = await Progress.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(progress);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
