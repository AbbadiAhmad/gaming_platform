# Game Scoring Dashboard - Implementation Plan

## Project Overview
A comprehensive web application for managing game competitions with real-time scoring, multiple user roles, and a public dashboard for displaying results.

## Tech Stack

### Frontend
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **UI Components**: Vuestic UI + Custom components
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO Client
- **Routing**: Vue Router
- **HTTP Client**: Axios

### Backend
- **Framework**: Node.js + Express
- **Database**: SQLite3
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.IO
- **ORM**: Better-SQLite3 (for simplicity and performance)
- **Validation**: express-validator

### DevOps
- **Containerization**: Docker (single container, frontend + backend)
- **Static Files**: Express serves built frontend (no nginx needed)

## Database Schema

### Tables

#### 1. users
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'evaluator')),
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. groups
```sql
CREATE TABLE groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    show_on_dashboard INTEGER DEFAULT 1,
    display_order INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. teams
```sql
CREATE TABLE teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    group_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    UNIQUE(name, group_id)
);
```

#### 4. games
```sql
CREATE TABLE games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    display_order INTEGER NOT NULL,
    show_on_dashboard INTEGER DEFAULT 1,
    min_points REAL NOT NULL DEFAULT 0,
    max_points REAL NOT NULL DEFAULT 100,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 5. place_scores
```sql
-- Supports unlimited places (1st, 2nd, 3rd, 4th, ...)
-- Multiple teams can have same place (ties get same score)
CREATE TABLE place_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    place INTEGER UNIQUE NOT NULL,
    score REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 6. game_evaluations
```sql
-- place and game_score are calculated fields (denormalized for performance)
-- Auto-recalculated when points change or place_scores config changes
CREATE TABLE game_evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    points REAL NOT NULL,
    place INTEGER,              -- Calculated from points ranking
    game_score REAL DEFAULT 0,  -- Looked up from place_scores[place]
    evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    evaluated_by INTEGER,
    FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (evaluated_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(game_id, team_id, group_id)
);
```

#### 7. app_settings
```sql
CREATE TABLE app_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Scoring Logic Flow

1. **Team gets points in a game**: Evaluator enters points (validated between min_points and max_points)
2. **Calculate place within group**: Rank all teams in the same group for that game by points (DESC)
   - **Ties handled**: Teams with identical points get the same place
3. **Assign game score based on place**: Look up place in `place_scores` table
4. **Calculate total team score**: Sum all game_scores for the team across all games in their group

### Example Calculation
```
Group 1, Game "Basketball":
- Team A: 17 points → 1st place → 5 game_score
- Team B: 17 points → 1st place → 5 game_score (tied!)
- Team C: 15 points → 3rd place → 3 game_score

Team A's total in Group 1: 5 + (scores from other games...)
```

## Real-time & Minimal Data Transfer

**Strategy**: Delta updates only, lightweight payloads
- **WebSocket events**: Emit only changed evaluations (not full dataset)
- **Dashboard API**: Returns ~1KB JSON per group (top teams + totals)
- **Client caching**: Store full state, only update deltas
- **Polling fallback**: Dashboard polls every 5s if WebSocket fails

**Example WebSocket Event**:
```json
{
  "type": "evaluation_updated",
  "data": {
    "groupId": 1,
    "teamId": 5,
    "gameId": 3,
    "newTotal": 23
  }
}
```

## Project Structure

```
gaming_platform/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── GroupsManager.vue
│   │   │   │   ├── TeamsManager.vue
│   │   │   │   ├── GamesManager.vue
│   │   │   │   ├── PlaceScoresManager.vue
│   │   │   │   └── UsersManager.vue
│   │   │   ├── evaluator/
│   │   │   │   └── GameEvaluation.vue
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardView.vue
│   │   │   │   ├── GroupStandings.vue
│   │   │   │   └── GamesStatus.vue
│   │   │   ├── results/
│   │   │   │   └── ResultsView.vue
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.vue
│   │   │   │   ├── ChangePassword.vue
│   │   │   │   └── FirstTimeSetup.vue
│   │   │   └── common/
│   │   │       ├── NavBar.vue
│   │   │       └── Sidebar.vue
│   │   ├── layouts/
│   │   │   ├── DefaultLayout.vue
│   │   │   ├── AuthLayout.vue
│   │   │   └── DashboardLayout.vue
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── stores/
│   │   │   ├── auth.js
│   │   │   ├── groups.js
│   │   │   ├── teams.js
│   │   │   ├── games.js
│   │   │   ├── evaluations.js
│   │   │   └── dashboard.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── utils/
│   │   │   ├── scoring.js
│   │   │   └── validators.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── config.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Group.js
│   │   │   ├── Team.js
│   │   │   ├── Game.js
│   │   │   ├── PlaceScore.js
│   │   │   └── GameEvaluation.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── adminOnly.js
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── groups.js
│   │   │   ├── teams.js
│   │   │   ├── games.js
│   │   │   ├── placeScores.js
│   │   │   ├── evaluations.js
│   │   │   └── dashboard.js
│   │   ├── services/
│   │   │   ├── scoringService.js
│   │   │   └── authService.js
│   │   ├── socket/
│   │   │   └── socketHandler.js
│   │   ├── utils/
│   │   │   └── validation.js
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── Dockerfile                    # Single container (backend + built frontend)
├── docker-compose.yml
├── .dockerignore
│
├── data/
│   └── gaming_platform.db       # SQLite database (created at runtime)
│
├── .gitignore
├── README.md
└── IMPLEMENTATION_PLAN.md
```

## Implementation Phases

### Phase 1: Project Setup & Backend Core (Days 1-2)

#### 1.1 Project Initialization
- [ ] Create folder structure
- [ ] Initialize npm projects (frontend & backend)
- [ ] Set up Git ignore files
- [ ] Create environment templates

#### 1.2 Backend Foundation
- [ ] Set up Express server
- [ ] Configure SQLite database connection
- [ ] Create database initialization script
- [ ] Implement database models
- [ ] Create migration/seed system

#### 1.3 Authentication System
- [ ] Implement JWT authentication
- [ ] Create auth middleware
- [ ] Add first-time setup endpoint
- [ ] Implement password hashing
- [ ] Create auth routes (login, change password)

### Phase 2: Backend API Development (Days 3-4)

#### 2.1 CRUD Endpoints
- [ ] Users management (admin only)
- [ ] Groups management (admin only)
- [ ] Teams management (admin only)
- [ ] Games management (admin only)
- [ ] Place scores management (admin only)
- [ ] Game evaluations (authenticated users)

#### 2.2 Scoring Service
- [ ] Implement place calculation logic
- [ ] Implement game score assignment
- [ ] Implement total score calculation
- [ ] Create recalculation triggers
- [ ] Add validation for min/max points

#### 2.3 Dashboard API
- [ ] Get visible groups with standings
- [ ] Get games status (played/not played)
- [ ] Get top teams per group
- [ ] Optimize queries for performance

### Phase 3: Frontend Core (Days 5-6)

#### 3.1 Project Setup
- [ ] Initialize Vue 3 + Vite project
- [ ] Install dependencies (Pinia, Vue Router, Vuestic UI, Tailwind)
- [ ] Configure Tailwind CSS
- [ ] Set up layouts (Default, Auth, Dashboard)
- [ ] Create router configuration

#### 3.2 State Management
- [ ] Create Pinia stores for all entities
- [ ] Implement API service layer
- [ ] Set up axios interceptors for auth
- [ ] Create Socket.IO client setup

#### 3.3 Authentication UI
- [ ] Login page
- [ ] First-time setup page
- [ ] Change password modal
- [ ] Protected route guards
- [ ] Auth state persistence

### Phase 4: Admin Interface (Days 7-8)

#### 4.1 Configuration Pages
- [ ] Groups manager (CRUD + ordering + visibility toggle)
- [ ] Teams manager (CRUD with group assignment)
- [ ] Games manager (CRUD + ordering + min/max points + visibility)
- [ ] Place scores manager (CRUD with place ranking)
- [ ] Users manager (CRUD + role assignment + active toggle)

#### 4.2 UI/UX Polish
- [ ] Responsive tables with sorting/filtering
- [ ] Form validation
- [ ] Success/error notifications
- [ ] Confirmation dialogs
- [ ] Loading states

### Phase 5: Evaluation Interface (Days 9-10)

#### 5.1 Game Evaluation
- [ ] Group selection view
- [ ] Game selection view
- [ ] Team evaluation form with points input
- [ ] Real-time validation (min/max points)
- [ ] Batch evaluation support
- [ ] History view of evaluations

#### 5.2 Live Updates
- [ ] Socket.IO integration for real-time score updates
- [ ] Optimistic UI updates
- [ ] Conflict resolution

### Phase 6: Public Dashboard & Results (Days 11-12)

#### 6.1 Dashboard View
- [ ] Full-screen dashboard layout
- [ ] Group standings visualization (tables/charts)
- [ ] Top teams highlights
- [ ] Games status (played vs not played)
- [ ] Auto-refresh/real-time updates
- [ ] Rotational view for multiple groups (if applicable)
- [ ] Big screen optimization

#### 6.2 Results View
- [ ] Detailed results by group
- [ ] Game-by-game breakdown
- [ ] Team performance history
- [ ] Export functionality (PDF/CSV)

### Phase 7: Docker & Deployment (Day 13)

#### 7.1 Dockerization
- [ ] Create backend Dockerfile
- [ ] Create frontend Dockerfile (production build)
- [ ] Create nginx configuration
- [ ] Create docker-compose.yml
- [ ] Add volume for SQLite database
- [ ] Add environment variable configuration

#### 7.2 Documentation
- [ ] Write README with setup instructions
- [ ] Document API endpoints
- [ ] Create user guide
- [ ] Add deployment guide

### Phase 8: Testing & Refinement (Day 14)

#### 8.1 Testing
- [ ] Test scoring logic with various scenarios
- [ ] Test authentication flows
- [ ] Test admin operations
- [ ] Test evaluator operations
- [ ] Test dashboard with sample data
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing

#### 8.2 Performance Optimization
- [ ] Database query optimization
- [ ] Frontend bundle optimization
- [ ] Lazy loading routes
- [ ] Image optimization

#### 8.3 Security Audit
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Rate limiting
- [ ] Input validation

## Key Features Checklist

### User Roles & Permissions
- [x] Admin: Full access to all configuration
- [x] Evaluator: Can update game points
- [x] Public: Can view results and dashboard (no login required)

### Admin Capabilities
- [ ] Define groups (name, dashboard visibility, order)
- [ ] Define teams (name, group assignment)
- [ ] Define games (name, order, visibility, min/max points)
- [ ] Define place-to-score mapping
- [ ] Manage users (add, activate, deactivate, delete, update)
- [ ] Control dashboard visibility settings

### Evaluator Capabilities
- [ ] Navigate: Groups → Games → Evaluations
- [ ] Enter/update team points for games
- [ ] View evaluation history

### Dashboard Features
- [ ] Real-time updates
- [ ] Show only selected groups
- [ ] Display top teams per group
- [ ] Show games played vs not played
- [ ] Big screen friendly design
- [ ] Optional rotational view for multiple groups

### Scoring System
- [ ] Configurable min/max points per game
- [ ] Automatic place calculation based on points
- [ ] Automatic game score assignment based on place
- [ ] Real-time total score calculation
- [ ] Support for ties (same points = same place)

### Authentication
- [ ] Login page
- [ ] Change password
- [ ] First-time admin setup
- [ ] Session management
- [ ] Logout

## Technical Considerations

### Real-time Updates Strategy
- Use Socket.IO for bi-directional communication
- Emit events on evaluation updates
- Dashboard auto-refreshes on new data
- Optimistic updates on client

### Database Considerations
- SQLite is sufficient for moderate load (< 100 concurrent users)
- Single file database for easy backup
- Use transactions for data consistency
- Index foreign keys for query performance

### Scalability Notes
- For larger deployments, consider PostgreSQL/MySQL
- Add Redis for session storage and caching
- Implement rate limiting on API endpoints
- Add pagination for large datasets

### Security Best Practices
- Hash passwords with bcrypt (10+ rounds)
- Use HTTP-only cookies for JWT
- Implement CORS properly
- Validate all inputs
- Sanitize outputs to prevent XSS
- Use prepared statements (SQLite3 prevents SQL injection)

## Deployment Guide

### Development
```bash
# Backend serves both API and frontend
cd backend
npm install
npm run dev
```

### Production (Simple - Single Container)
```bash
# Frontend builds to backend/public, Express serves everything
docker-compose up -d
# Access at http://localhost:3000
```

### Environment Variables

**Backend (.env)** - Only file needed
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=24h
DATABASE_PATH=/app/data/gaming_platform.db
```

## Success Metrics

- [ ] Admin can configure entire system without technical knowledge
- [ ] Evaluators can quickly enter scores with minimal clicks
- [ ] Dashboard updates within 1 second of evaluation
- [ ] Dashboard is readable from 10+ meters on big screen
- [ ] System supports at least 10 groups, 20 teams per group, 15 games
- [ ] Response time < 200ms for API calls
- [ ] Zero downtime deployment with Docker

## Future Enhancements (Post-MVP)

- Multi-language support (i18n)
- Export results to Excel/PDF
- Email notifications for completed games
- Mobile app version
- Advanced analytics and charts
- Team logos/photos
- Game photos/media
- Audit log for all changes
- Backup/restore functionality
- Multi-tenancy support

---

## Getting Started

To begin implementation, follow the phases in order. Each phase builds upon the previous one. Start with Phase 1 and complete all tasks before moving to the next phase.

For questions or issues during implementation, refer to:
- Vue 3 docs: https://vuejs.org/
- Express docs: https://expressjs.com/
- Vuestic UI: https://vuestic.dev/
- Socket.IO: https://socket.io/

Good luck! 🚀
