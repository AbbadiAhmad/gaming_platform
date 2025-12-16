import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/config.js';
import { initDatabase } from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import setupSocket from './socket/socketHandler.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import groupRoutes from './routes/groups.js';
import teamRoutes from './routes/teams.js';
import gameRoutes from './routes/games.js';
import placeScoreRoutes from './routes/placeScores.js';
import evaluationRoutes from './routes/evaluations.js';
import dashboardRoutes from './routes/dashboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: config.corsOrigin }
});

// Initialize database
initDatabase();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());
app.set('io', io);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/place-scores', placeScoreRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve static frontend files
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Error handler
app.use(errorHandler);

// Setup WebSocket
setupSocket(io);

// Start server
httpServer.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});
