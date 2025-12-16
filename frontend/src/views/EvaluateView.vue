<template>
  <div class="evaluate-container">
    <h1>Game Evaluation</h1>

    <div class="nav-buttons mb-4">
      <va-button @click="$router.push('/dashboard')">Dashboard</va-button>
      <va-button @click="handleLogout">Logout</va-button>
    </div>

    <div class="step-1" v-if="!selectedGroup">
      <h2>Select Group</h2>
      <div class="card-grid">
        <va-card v-for="group in groups" :key="group.id" @click="selectGroup(group)" clickable>
          <va-card-title>{{ group.name }}</va-card-title>
        </va-card>
      </div>
    </div>

    <div class="step-2" v-else-if="!selectedGame">
      <va-button @click="selectedGroup = null" class="mb-4">← Back</va-button>
      <h2>Select Game - {{ selectedGroup.name }}</h2>
      <div class="card-grid">
        <va-card v-for="game in games" :key="game.id" @click="selectGame(game)" clickable>
          <va-card-title>{{ game.name }}</va-card-title>
          <va-card-content>
            Points: {{ game.min_points }} - {{ game.max_points }}
          </va-card-content>
        </va-card>
      </div>
    </div>

    <div class="step-3" v-else>
      <va-button @click="selectedGame = null" class="mb-4">← Back</va-button>
      <h2>{{ selectedGame.name }} - {{ selectedGroup.name }}</h2>

      <div v-for="team in teams" :key="team.id" class="team-row">
        <span class="team-name">{{ team.name }}</span>
        <va-input
          v-model.number="teamPoints[team.id]"
          type="number"
          :min="selectedGame.min_points"
          :max="selectedGame.max_points"
          placeholder="Enter points"
          class="points-input"
        />
        <va-button @click="saveEvaluation(team)" :loading="saving[team.id]">Save</va-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { getGroups, getGames, getTeamsByGroup, createEvaluation, getEvaluations } from '@/services/api';

const router = useRouter();
const authStore = useAuthStore();

const groups = ref([]);
const games = ref([]);
const teams = ref([]);

const selectedGroup = ref(null);
const selectedGame = ref(null);
const teamPoints = reactive({});
const saving = reactive({});

async function selectGroup(group) {
  selectedGroup.value = group;
  const res = await getTeamsByGroup(group.id);
  teams.value = res.data;

  // Load existing evaluations
  const evalRes = await getEvaluations(group.id);
  evalRes.data.forEach(e => {
    if (e.game_id === selectedGame.value?.id) {
      teamPoints[e.team_id] = e.points;
    }
  });
}

function selectGame(game) {
  selectedGame.value = game;

  // Load existing points for this game
  teams.value.forEach(team => {
    teamPoints[team.id] = teamPoints[team.id] || 0;
  });
}

async function saveEvaluation(team) {
  saving[team.id] = true;
  try {
    await createEvaluation({
      game_id: selectedGame.value.id,
      team_id: team.id,
      group_id: selectedGroup.value.id,
      points: teamPoints[team.id]
    });
  } finally {
    saving[team.id] = false;
  }
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}

onMounted(async () => {
  const [groupsRes, gamesRes] = await Promise.all([getGroups(), getGames()]);
  groups.value = groupsRes.data;
  games.value = gamesRes.data;
});
</script>

<style scoped>
.evaluate-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-buttons {
  display: flex;
  gap: 1rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.team-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.team-name {
  flex: 1;
  font-weight: 500;
}

.points-input {
  width: 150px;
}

.mb-4 {
  margin-bottom: 1.5rem;
}
</style>
