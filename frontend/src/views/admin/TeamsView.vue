<template>
  <div>
    <h1>Teams Management</h1>

    <va-button @click="showModal = true" class="mb-4">Add Team</va-button>

    <va-data-table :items="teams" :columns="columns">
      <template #cell(actions)="{ rowData }">
        <va-button size="small" @click="editItem(rowData)" class="mr-2">Edit</va-button>
        <va-button size="small" color="danger" @click="deleteItem(rowData.id)">Delete</va-button>
      </template>
    </va-data-table>

    <va-modal v-model="showModal" title="Team">
      <va-input v-model="form.name" label="Name" class="mb-3" />
      <va-select v-model="form.group_id" label="Group" :options="groupOptions" class="mb-3" />

      <template #footer>
        <va-button @click="saveItem">Save</va-button>
      </template>
    </va-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getTeams, createTeam, updateTeam, deleteTeam, getGroups } from '@/services/api';

const teams = ref([]);
const groups = ref([]);
const showModal = ref(false);
const form = ref({ name: '', group_id: null });
const editingId = ref(null);

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'group_id', label: 'Group ID' },
  { key: 'actions', label: 'Actions' }
];

const groupOptions = computed(() =>
  groups.value.map(g => ({ value: g.id, text: g.name }))
);

async function fetchData() {
  const [teamsRes, groupsRes] = await Promise.all([getTeams(), getGroups()]);
  teams.value = teamsRes.data;
  groups.value = groupsRes.data;
}

function editItem(item) {
  form.value = { ...item };
  editingId.value = item.id;
  showModal.value = true;
}

async function saveItem() {
  if (editingId.value) {
    await updateTeam(editingId.value, form.value);
  } else {
    await createTeam(form.value);
  }
  showModal.value = false;
  form.value = { name: '', group_id: null };
  editingId.value = null;
  fetchData();
}

async function deleteItem(id) {
  if (confirm('Delete this team?')) {
    await deleteTeam(id);
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
