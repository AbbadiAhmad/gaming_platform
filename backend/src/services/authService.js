import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/config.js';

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
}

export async function login(username, password) {
  const user = User.findByUsername(username);

  if (!user || !user.active) {
    return null;
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    return null;
  }

  const token = generateToken(user);
  return { token, user: { id: user.id, username: user.username, role: user.role } };
}

export async function createFirstAdmin(username, password) {
  if (User.hasAnyUsers()) {
    throw new Error('Users already exist');
  }

  const passwordHash = await hashPassword(password);
  const userId = User.create(username, passwordHash, 'admin');

  return { id: userId, username, role: 'admin' };
}
