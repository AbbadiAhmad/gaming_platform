import db from '../config/database.js';

export default class PlaceScore {
  static getAll() {
    return db.prepare('SELECT * FROM place_scores ORDER BY place').all();
  }

  static findByPlace(place) {
    return db.prepare('SELECT * FROM place_scores WHERE place = ?').get(place);
  }

  static create(place, score) {
    const stmt = db.prepare('INSERT INTO place_scores (place, score) VALUES (?, ?)');
    const result = stmt.run(place, score);
    return result.lastInsertRowid;
  }

  static update(id, place, score) {
    const stmt = db.prepare('UPDATE place_scores SET place = ?, score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(place, score, id);
  }

  static delete(id) {
    return db.prepare('DELETE FROM place_scores WHERE id = ?').run(id);
  }

  static getScoreForPlace(place) {
    const result = this.findByPlace(place);
    return result ? result.score : 0;
  }
}
