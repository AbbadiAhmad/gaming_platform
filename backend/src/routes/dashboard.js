import express from 'express';
import Group from '../models/Group.js';
import Game from '../models/Game.js';
import GameEvaluation from '../models/GameEvaluation.js';
import { getGroupStandings } from '../services/scoringService.js';

const router = express.Router();

// Public dashboard data
router.get('/', (req, res) => {
  const groups = Group.getVisible();
  const games = Game.getVisible();

  const dashboardData = {
    groups: groups.map(group => {
      const standings = getGroupStandings(group.id);

      return {
        id: group.id,
        name: group.name,
        topTeams: standings.slice(0, 5),
        allTeams: standings
      };
    }),
    games: games.map(game => {
      const evaluations = GameEvaluation.getByGame(game.id);
      return {
        id: game.id,
        name: game.name,
        played: evaluations.length > 0
      };
    })
  };

  res.json(dashboardData);
});

// Results page (all groups, all teams)
router.get('/results', (req, res) => {
  const groups = Group.getAll();
  const games = Game.getAll();

  const results = {
    groups: groups.map(group => ({
      id: group.id,
      name: group.name,
      standings: getGroupStandings(group.id)
    })),
    games: games
  };

  res.json(results);
});

export default router;
