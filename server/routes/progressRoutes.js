const express = require('express');
const router = express.Router({ mergeParams: true });

router.get('/:userId', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/:userId', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.patch('/:userId', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

module.exports = router;
