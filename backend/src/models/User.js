import db from '../config/database.js';

export default class User {
  static findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  static findByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  }

  static getAll() {
    return db.prepare('SELECT id, username, role, active, created_at FROM users').all();
  }

  static create(username, passwordHash, role = 'evaluator') {
    const stmt = db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)');
    const result = stmt.run(username, passwordHash, role);
    return result.lastInsertRowid;
  }

  static update(id, updates) {
    const fields = [];
    const values = [];

    if (updates.username !== undefined) {
      fields.push('username = ?');
      values.push(updates.username);
    }
    if (updates.password_hash !== undefined) {
      fields.push('password_hash = ?');
      values.push(updates.password_hash);
    }
    if (updates.role !== undefined) {
      fields.push('role = ?');
      values.push(updates.role);
    }
    if (updates.active !== undefined) {
      fields.push('active = ?');
      values.push(updates.active);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    return stmt.run(...values);
  }

  static delete(id) {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id);
  }

  static hasAnyUsers() {
    const result = db.prepare('SELECT COUNT(*) as count FROM users').get();
    return result.count > 0;
  }
}
