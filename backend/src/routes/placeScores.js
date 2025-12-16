import express from 'express';
import PlaceScore from '../models/PlaceScore.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { recalculateAllScores } from '../services/scoringService.js';

const router = express.Router();

router.get('/', (req, res) => {
  const placeScores = PlaceScore.getAll();
  res.json(placeScores);
});

router.post('/', authenticate, requireAdmin, (req, res) => {
  try {
    const { place, score } = req.body;
    const id = PlaceScore.create(place, score);
    recalculateAllScores();
    res.json({ id, place, score });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    const { place, score } = req.body;
    PlaceScore.update(req.params.id, place, score);
    recalculateAllScores();
    res.json({ message: 'Place score updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    PlaceScore.delete(req.params.id);
    recalculateAllScores();
    res.json({ message: 'Place score deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
