import express from 'express';
import Game from '../models/Game.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  const games = Game.getAll();
  res.json(games);
});

router.post('/', authenticate, requireAdmin, (req, res) => {
  try {
    const { name, display_order, show_on_dashboard, min_points, max_points } = req.body;
    const id = Game.create(name, display_order, show_on_dashboard, min_points, max_points);
    res.json({ id, name, display_order, show_on_dashboard, min_points, max_points });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    const { name, display_order, show_on_dashboard, min_points, max_points } = req.body;
    Game.update(req.params.id, name, display_order, show_on_dashboard, min_points, max_points);
    res.json({ message: 'Game updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    Game.delete(req.params.id);
    res.json({ message: 'Game deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
