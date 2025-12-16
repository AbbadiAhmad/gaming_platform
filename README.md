# Game Scoring Dashboard

Real-time game competition scoring platform with admin configuration, evaluator interface, and public dashboard.

## Features

- **Admin Panel**: Configure groups, teams, games, scoring rules, and users
- **Evaluator Interface**: Enter team points for games
- **Public Dashboard**: Real-time leaderboard with big screen support
- **Scoring System**: Automatic place calculation with tie handling
- **Authentication**: JWT-based auth with role management (admin/evaluator)
- **Real-time Updates**: WebSocket for instant score updates

## Quick Start

### Using Docker (Recommended)

```bash
docker-compose up -d
```

Access at http://localhost:3000

### Manual Setup

**Backend:**
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## First-Time Setup

1. Visit http://localhost:3000/setup
2. Create admin account
3. Login and configure:
   - Groups (with dashboard visibility)
   - Teams (assign to groups)
   - Games (set min/max points, order)
   - Place Scores (1st=5pts, 2nd=3pts, etc.)

## Usage

### Admin
- Configure all settings
- Manage users
- Control dashboard visibility

### Evaluator
- Navigate: Groups → Games → Enter Points
- Points auto-calculate places and scores

### Public
- View dashboard (no login)
- See real-time standings
- Track game progress

## Tech Stack

- **Backend**: Node.js, Express, SQLite, Socket.IO
- **Frontend**: Vue 3, Vuestic UI, Pinia
- **Deploy**: Docker

## API Endpoints

- `GET /api/dashboard` - Public dashboard data
- `POST /api/auth/login` - User login
- `GET /api/groups` - List groups
- `POST /api/evaluations` - Submit evaluation
- See `backend/src/routes/` for full API

## Environment Variables

```env
PORT=3000
JWT_SECRET=your-secret-key
DATABASE_PATH=/app/data/gaming_platform.db
```

## Scoring Logic

1. Team gets points in game (validated: min ≤ points ≤ max)
2. Teams ranked by points (DESC) → Place assigned
3. Ties get same place (e.g., 2 teams @ 17pts = both 1st)
4. Place → Game Score (from config: 1st=5, 2nd=3, etc.)
5. Total = Sum of all game scores

## Database Schema

- `users` - Auth & roles
- `groups` - Competition groups
- `teams` - Teams in groups
- `games` - Games with point ranges
- `place_scores` - Place→Score mapping
- `game_evaluations` - Team points & calculated scores

## License

MIT
