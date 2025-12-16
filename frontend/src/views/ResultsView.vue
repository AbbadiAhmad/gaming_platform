<template>
  <div class="results-container">
    <div class="results-header">
      <h1>Results</h1>
      <va-button @click="$router.push('/dashboard')">Back to Dashboard</va-button>
    </div>

    <div v-if="loading">Loading...</div>

    <div v-else-if="data" class="results-content">
      <div v-for="group in data.groups" :key="group.id" class="group-results">
        <h2>{{ group.name }}</h2>
        <va-data-table :items="group.standings" :columns="columns" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getResults } from '@/services/api';

const data = ref(null);
const loading = ref(true);

const columns = [
  { key: 'teamName', label: 'Team', sortable: true },
  { key: 'totalScore', label: 'Total Score', sortable: true },
  { key: 'gamesPlayed', label: 'Games Played', sortable: true }
];

onMounted(async () => {
  try {
    const response = await getResults();
    data.value = response.data;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.results-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.group-results {
  margin-bottom: 3rem;
}

.group-results h2 {
  margin-bottom: 1rem;
}
</style>
