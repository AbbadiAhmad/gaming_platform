import express from 'express';
import Team from '../models/Team.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  const teams = Team.getAll();
  res.json(teams);
});

router.get('/group/:groupId', (req, res) => {
  const teams = Team.getByGroup(req.params.groupId);
  res.json(teams);
});

router.post('/', authenticate, requireAdmin, (req, res) => {
  try {
    const { name, group_id } = req.body;
    const id = Team.create(name, group_id);
    res.json({ id, name, group_id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    const { name, group_id } = req.body;
    Team.update(req.params.id, name, group_id);
    res.json({ message: 'Team updated' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  try {
    Team.delete(req.params.id);
    res.json({ message: 'Team deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
