const express = require('express');
const router = express.Router();

const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    const safeUsers = users.map(u => {
      const obj = u.toObject();
      obj.hasPin = !!obj.pin;
      delete obj.pin;
      return obj;
    });
    res.json(safeUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const safeUser = user.toObject();
    safeUser.hasPin = !!safeUser.pin;
    delete safeUser.pin;
    
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    
    // Don't send back the pin in creation response
    const userResponse = user.toObject();
    delete userResponse.pin;
    
    res.status(201).json(userResponse);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { userId, pin } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'child' && user.pin) {
      if (!pin || pin !== user.pin) {
        return res.status(401).json({ error: 'Invalid PIN' });
      }
    }

    const userResponse = user.toObject();
    delete userResponse.pin;
    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
