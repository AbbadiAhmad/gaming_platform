import db from '../config/database.js';

export default class GameEvaluation {
  static getAll() {
    return db.prepare('SELECT * FROM game_evaluations').all();
  }

  static getByGroup(groupId) {
    return db.prepare('SELECT * FROM game_evaluations WHERE group_id = ?').all(groupId);
  }

  static getByGame(gameId) {
    return db.prepare('SELECT * FROM game_evaluations WHERE game_id = ?').all(gameId);
  }

  static getByTeam(teamId) {
    return db.prepare('SELECT * FROM game_evaluations WHERE team_id = ?').all(teamId);
  }

  static find(gameId, teamId, groupId) {
    return db.prepare('SELECT * FROM game_evaluations WHERE game_id = ? AND team_id = ? AND group_id = ?')
      .get(gameId, teamId, groupId);
  }

  static upsert(gameId, teamId, groupId, points, place, gameScore, evaluatedBy) {
    const existing = this.find(gameId, teamId, groupId);

    if (existing) {
      const stmt = db.prepare(`
        UPDATE game_evaluations
        SET points = ?, place = ?, game_score = ?, evaluated_at = CURRENT_TIMESTAMP, evaluated_by = ?
        WHERE game_id = ? AND team_id = ? AND group_id = ?
      `);
      stmt.run(points, place, gameScore, evaluatedBy, gameId, teamId, groupId);
      return existing.id;
    } else {
      const stmt = db.prepare(`
        INSERT INTO game_evaluations (game_id, team_id, group_id, points, place, game_score, evaluated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(gameId, teamId, groupId, points, place, gameScore, evaluatedBy);
      return result.lastInsertRowid;
    }
  }

  static getTeamTotal(teamId, groupId) {
    const result = db.prepare('SELECT SUM(game_score) as total FROM game_evaluations WHERE team_id = ? AND group_id = ?')
      .get(teamId, groupId);
    return result.total || 0;
  }

  static delete(id) {
    return db.prepare('DELETE FROM game_evaluations WHERE id = ?').run(id);
  }
}
