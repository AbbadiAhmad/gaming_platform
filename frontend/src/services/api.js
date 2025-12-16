import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth
export const checkSetupNeeded = () => api.get('/auth/setup-needed');
export const setupAdmin = (data) => api.post('/auth/setup', data);
export const login = (data) => api.post('/auth/login', data);
export const changePassword = (data) => api.post('/auth/change-password', data);

// Users
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Groups
export const getGroups = () => api.get('/groups');
export const createGroup = (data) => api.post('/groups', data);
export const updateGroup = (id, data) => api.put(`/groups/${id}`, data);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);

// Teams
export const getTeams = () => api.get('/teams');
export const getTeamsByGroup = (groupId) => api.get(`/teams/group/${groupId}`);
export const createTeam = (data) => api.post('/teams', data);
export const updateTeam = (id, data) => api.put(`/teams/${id}`, data);
export const deleteTeam = (id) => api.delete(`/teams/${id}`);

// Games
export const getGames = () => api.get('/games');
export const createGame = (data) => api.post('/games', data);
export const updateGame = (id, data) => api.put(`/games/${id}`, data);
export const deleteGame = (id) => api.delete(`/games/${id}`);

// Place Scores
export const getPlaceScores = () => api.get('/place-scores');
export const createPlaceScore = (data) => api.post('/place-scores', data);
export const updatePlaceScore = (id, data) => api.put(`/place-scores/${id}`, data);
export const deletePlaceScore = (id) => api.delete(`/place-scores/${id}`);

// Evaluations
export const getEvaluations = (groupId) => api.get(`/evaluations/group/${groupId}`);
export const getStandings = (groupId) => api.get(`/evaluations/standings/${groupId}`);
export const createEvaluation = (data) => api.post('/evaluations', data);

// Dashboard
export const getDashboard = () => api.get('/dashboard');
export const getResults = () => api.get('/dashboard/results');
