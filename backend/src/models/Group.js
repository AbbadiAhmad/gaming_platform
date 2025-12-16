import db from '../config/database.js';

export default class Group {
  static getAll() {
    return db.prepare('SELECT * FROM groups ORDER BY display_order').all();
  }

  static getVisible() {
    return db.prepare('SELECT * FROM groups WHERE show_on_dashboard = 1 ORDER BY display_order').all();
  }

  static findById(id) {
    return db.prepare('SELECT * FROM groups WHERE id = ?').get(id);
  }

  static create(name, showOnDashboard = 1, displayOrder) {
    const stmt = db.prepare('INSERT INTO groups (name, show_on_dashboard, display_order) VALUES (?, ?, ?)');
    const result = stmt.run(name, showOnDashboard, displayOrder);
    return result.lastInsertRowid;
  }

  static update(id, name, showOnDashboard, displayOrder) {
    const stmt = db.prepare('UPDATE groups SET name = ?, show_on_dashboard = ?, display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(name, showOnDashboard, displayOrder, id);
  }

  static delete(id) {
    return db.prepare('DELETE FROM groups WHERE id = ?').run(id);
  }
}
