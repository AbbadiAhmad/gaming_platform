import db from '../config/database.js';

export default class Team {
  static getAll() {
    return db.prepare('SELECT * FROM teams ORDER BY name').all();
  }

  static getByGroup(groupId) {
    return db.prepare('SELECT * FROM teams WHERE group_id = ? ORDER BY name').all(groupId);
  }

  static findById(id) {
    return db.prepare('SELECT * FROM teams WHERE id = ?').get(id);
  }

  static create(name, groupId) {
    const stmt = db.prepare('INSERT INTO teams (name, group_id) VALUES (?, ?)');
    const result = stmt.run(name, groupId);
    return result.lastInsertRowid;
  }

  static update(id, name, groupId) {
    const stmt = db.prepare('UPDATE teams SET name = ?, group_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(name, groupId, id);
  }

  static delete(id) {
    return db.prepare('DELETE FROM teams WHERE id = ?').run(id);
  }
}
