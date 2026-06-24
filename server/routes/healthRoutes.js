const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'fff-thesis-server',
    timestamp: new Date().toISOString(),
  });
});

router.get('/data-status', (req, res) => {
  const state = mongoose.connection.readyState;

  if (!process.env.MONGODB_URI) {
    return res.status(200).json({
      status: 'not_configured',
      message: 'Data storage is not configured yet'
    });
  }

  if (state !== 1) {
    return res.status(503).json({
      status: 'error',
      message: 'Data storage connection failed'
    });
  }

  res.json({
    status: 'connected',
    message: 'Data storage is connected'
  });
});

module.exports = router;
