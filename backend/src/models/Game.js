import db from '../config/database.js';

export default class Game {
  static getAll() {
    return db.prepare('SELECT * FROM games ORDER BY display_order').all();
  }

  static getVisible() {
    return db.prepare('SELECT * FROM games WHERE show_on_dashboard = 1 ORDER BY display_order').all();
  }

  static findById(id) {
    return db.prepare('SELECT * FROM games WHERE id = ?').get(id);
  }

  static create(name, displayOrder, showOnDashboard = 1, minPoints = 0, maxPoints = 100) {
    const stmt = db.prepare('INSERT INTO games (name, display_order, show_on_dashboard, min_points, max_points) VALUES (?, ?, ?, ?, ?)');
    const result = stmt.run(name, displayOrder, showOnDashboard, minPoints, maxPoints);
    return result.lastInsertRowid;
  }

  static update(id, name, displayOrder, showOnDashboard, minPoints, maxPoints) {
    const stmt = db.prepare('UPDATE games SET name = ?, display_order = ?, show_on_dashboard = ?, min_points = ?, max_points = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(name, displayOrder, showOnDashboard, minPoints, maxPoints, id);
  }

  static delete(id) {
    return db.prepare('DELETE FROM games WHERE id = ?').run(id);
  }
}
