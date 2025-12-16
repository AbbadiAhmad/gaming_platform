import express from 'express';
import GameEvaluation from '../models/GameEvaluation.js';
import Game from '../models/Game.js';
import { authenticate } from '../middleware/auth.js';
import { evaluateTeam, getGroupStandings } from '../services/scoringService.js';

const router = express.Router();

router.get('/group/:groupId', (req, res) => {
  const evaluations = GameEvaluation.getByGroup(req.params.groupId);
  res.json(evaluations);
});

router.get('/standings/:groupId', (req, res) => {
  const standings = getGroupStandings(req.params.groupId);
  res.json(standings);
});

router.post('/', authenticate, (req, res) => {
  try {
    const { game_id, team_id, group_id, points } = req.body;

    if (!game_id || !team_id || !group_id || points === undefined) {
      return res.status(400).json({ error: 'game_id, team_id, group_id, and points required' });
    }

    const game = Game.findById(game_id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (points < game.min_points || points > game.max_points) {
      return res.status(400).json({
        error: `Points must be between ${game.min_points} and ${game.max_points}`
      });
    }

    evaluateTeam(game_id, team_id, group_id, points, req.user.id);

    const io = req.app.get('io');
    if (io) {
      io.emit('evaluation_updated', { game_id, team_id, group_id });
    }

    res.json({ message: 'Evaluation saved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
