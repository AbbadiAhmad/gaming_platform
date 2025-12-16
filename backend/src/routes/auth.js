import express from 'express';
import { login, createFirstAdmin, hashPassword } from '../services/authService.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Check if first-time setup is needed
router.get('/setup-needed', (req, res) => {
  res.json({ needed: !User.hasAnyUsers() });
});

// First-time admin setup
router.post('/setup', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const admin = await createFirstAdmin(username, password);
    res.json({ message: 'Admin created', admin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const result = await login(username, password);

    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }

    const user = User.findById(req.user.id);
    const { comparePassword } = await import('../services/authService.js');
    const valid = await comparePassword(currentPassword, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    const newHash = await hashPassword(newPassword);
    User.update(req.user.id, { password_hash: newHash });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
