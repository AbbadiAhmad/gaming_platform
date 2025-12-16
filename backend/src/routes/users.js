import express from 'express';
import User from '../models/User.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { hashPassword } from '../services/authService.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/', (req, res) => {
  const users = User.getAll();
  res.json(users);
});

router.post('/', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Username, password, and role required' });
    }

    const passwordHash = await hashPassword(password);
    const userId = User.create(username, passwordHash, role);

    res.json({ id: userId, username, role });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { username, password, role, active } = req.body;
    const updates = {};

    if (username !== undefined) updates.username = username;
    if (role !== undefined) updates.role = role;
    if (active !== undefined) updates.active = active;
    if (password) updates.password_hash = await hashPassword(password);

    User.update(req.params.id, updates);
    res.json({ message: 'User updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    User.delete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
