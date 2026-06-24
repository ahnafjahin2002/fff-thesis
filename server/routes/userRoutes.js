const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.get('/:id', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/', (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

module.exports = router;
