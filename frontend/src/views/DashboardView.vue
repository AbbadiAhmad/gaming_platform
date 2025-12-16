<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1>Game Scoring Dashboard</h1>
    </div>

    <div v-if="loading" class="loading">Loading...</div>

    <div v-else-if="data" class="dashboard-content">
      <div v-for="group in data.groups" :key="group.id" class="group-section">
        <h2>{{ group.name }}</h2>
        <table class="standings-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              <th>Total Score</th>
              <th>Games</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(team, index) in group.topTeams" :key="team.teamId">
              <td>{{ index + 1 }}</td>
              <td>{{ team.teamName }}</td>
              <td class="score">{{ team.totalScore }}</td>
              <td>{{ team.gamesPlayed }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="games-section">
        <h2>Games Status</h2>
        <div class="games-grid">
          <div v-for="game in data.games" :key="game.id" class="game-card" :class="{ played: game.played }">
            <span>{{ game.name }}</span>
            <span class="status">{{ game.played ? '✓' : '○' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useDashboardStore } from '@/stores/dashboard';

const dashboardStore = useDashboardStore();
const { data, loading } = storeToRefs(dashboardStore);

onMounted(() => {
  dashboardStore.fetchDashboard();
  dashboardStore.connectSocket();
});

onUnmounted(() => {
  dashboardStore.disconnectSocket();
});
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  padding: 2rem;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-header h1 {
  font-size: 3rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
}

.group-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
}

.group-section h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.standings-table {
  width: 100%;
  border-collapse: collapse;
}

.standings-table th,
.standings-table td {
  padding: 1rem;
  text-align: left;
}

.standings-table th {
  border-bottom: 2px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
}

.standings-table tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.standings-table .score {
  font-size: 1.5rem;
  font-weight: bold;
}

.games-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

.games-section h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.game-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
}

.game-card.played {
  background: rgba(76, 175, 80, 0.3);
}

.game-card .status {
  font-size: 1.5rem;
}

.loading {
  text-align: center;
  font-size: 2rem;
  padding: 4rem;
}
</style>
