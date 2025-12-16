import express from 'express';
import Group from '../models/Group.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  const groups = Group.getAll();
  res.json(groups);
});

router.post('/', authenticate, requireAdmin, (req, res) => {
  try {
    const { name, show_on_dashboard, display_order } = req.body;
    const id = Group.create(name, show_on_dashboard, display_order);
    res.json({ id, name, show_on_dashboard, display_order });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    const { name, show_on_dashboard, display_order } = req.body;
    Group.update(req.params.id, name, show_on_dashboard, display_order);
    res.json({ message: 'Group updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    Group.delete(req.params.id);
    res.json({ message: 'Group deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
