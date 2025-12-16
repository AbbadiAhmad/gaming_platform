<template>
  <div>
    <h1>Place Scores Configuration</h1>
    <p class="mb-4">Define the score for each place (1st, 2nd, 3rd, etc.)</p>

    <va-button @click="showModal = true" class="mb-4">Add Place Score</va-button>

    <va-data-table :items="placeScores" :columns="columns">
      <template #cell(actions)="{ rowData }">
        <va-button size="small" @click="editItem(rowData)" class="mr-2">Edit</va-button>
        <va-button size="small" color="danger" @click="deleteItem(rowData.id)">Delete</va-button>
      </template>
    </va-data-table>

    <va-modal v-model="showModal" title="Place Score">
      <va-input v-model.number="form.place" type="number" label="Place (1 = 1st, 2 = 2nd, etc.)" class="mb-3" />
      <va-input v-model.number="form.score" type="number" label="Score" class="mb-3" />

      <template #footer>
        <va-button @click="saveItem">Save</va-button>
      </template>
    </va-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPlaceScores, createPlaceScore, updatePlaceScore, deletePlaceScore } from '@/services/api';

const placeScores = ref([]);
const showModal = ref(false);
const form = ref({ place: 1, score: 0 });
const editingId = ref(null);

const columns = [
  { key: 'place', label: 'Place' },
  { key: 'score', label: 'Score' },
  { key: 'actions', label: 'Actions' }
];

async function fetchData() {
  const res = await getPlaceScores();
  placeScores.value = res.data;
}

function editItem(item) {
  form.value = { ...item };
  editingId.value = item.id;
  showModal.value = true;
}

async function saveItem() {
  if (editingId.value) {
    await updatePlaceScore(editingId.value, form.value);
  } else {
    await createPlaceScore(form.value);
  }
  showModal.value = false;
  form.value = { place: 1, score: 0 };
  editingId.value = null;
  fetchData();
}

async function deleteItem(id) {
  if (confirm('Delete this place score?')) {
    await deletePlaceScore(id);
    fetchData();
  }
}

onMounted(fetchData);
</script>

<style scoped>
.mb-3 {
  margin-bottom: 1rem;
}
.mb-4 {
  margin-bottom: 1.5rem;
}
.mr-2 {
  margin-right: 0.5rem;
}
</style>
