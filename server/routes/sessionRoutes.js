const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.get('/:userId', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

module.exports = router;
