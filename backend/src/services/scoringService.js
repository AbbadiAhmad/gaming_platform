import GameEvaluation from '../models/GameEvaluation.js';
import PlaceScore from '../models/PlaceScore.js';
import Team from '../models/Team.js';

// Recalculate places and game scores for a specific game and group
export function recalculateGameScores(gameId, groupId) {
  const evaluations = GameEvaluation.getByGroup(groupId)
    .filter(e => e.game_id === gameId);

  // Sort by points (descending), teams with same points get same place
  evaluations.sort((a, b) => b.points - a.points);

  let currentPlace = 1;
  let previousPoints = null;

  for (let i = 0; i < evaluations.length; i++) {
    const eval_ = evaluations[i];

    // Tie handling: if points are same as previous, keep same place
    if (previousPoints !== null && eval_.points === previousPoints) {
      // Same place as previous team
    } else {
      currentPlace = i + 1;
    }

    previousPoints = eval_.points;

    const gameScore = PlaceScore.getScoreForPlace(currentPlace);

    GameEvaluation.upsert(
      eval_.game_id,
      eval_.team_id,
      eval_.group_id,
      eval_.points,
      currentPlace,
      gameScore,
      eval_.evaluated_by
    );
  }
}

// Evaluate a team's performance in a game
export function evaluateTeam(gameId, teamId, groupId, points, evaluatedBy) {
  // First, update this team's evaluation
  GameEvaluation.upsert(gameId, teamId, groupId, points, null, 0, evaluatedBy);

  // Recalculate all places and scores for this game/group
  recalculateGameScores(gameId, groupId);
}

// Get team standings for a group
export function getGroupStandings(groupId) {
  const teams = Team.getByGroup(groupId);
  const standings = teams.map(team => {
    const total = GameEvaluation.getTeamTotal(team.id, groupId);
    const evaluations = GameEvaluation.getByTeam(team.id).filter(e => e.group_id === groupId);

    return {
      teamId: team.id,
      teamName: team.name,
      totalScore: total,
      gamesPlayed: evaluations.length,
      evaluations: evaluations.map(e => ({
        gameId: e.game_id,
        points: e.points,
        place: e.place,
        gameScore: e.game_score
      }))
    };
  });

  // Sort by total score descending
  standings.sort((a, b) => b.totalScore - a.totalScore);

  return standings;
}

// Recalculate all scores when place_scores config changes
export function recalculateAllScores() {
  const allEvaluations = GameEvaluation.getAll();

  const gameGroups = {};
  allEvaluations.forEach(e => {
    const key = `${e.game_id}-${e.group_id}`;
    if (!gameGroups[key]) {
      gameGroups[key] = { gameId: e.game_id, groupId: e.group_id };
    }
  });

  Object.values(gameGroups).forEach(({ gameId, groupId }) => {
    recalculateGameScores(gameId, groupId);
  });
}
