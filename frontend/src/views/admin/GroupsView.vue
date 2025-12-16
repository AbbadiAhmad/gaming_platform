<template>
  <div>
    <h1>Groups Management</h1>

    <va-button @click="showModal = true" class="mb-4">Add Group</va-button>

    <va-data-table :items="groups" :columns="columns">
      <template #cell(show_on_dashboard)="{ value }">
        {{ value ? 'Yes' : 'No' }}
      </template>
      <template #cell(actions)="{ rowData }">
        <va-button size="small" @click="editItem(rowData)" class="mr-2">Edit</va-button>
        <va-button size="small" color="danger" @click="deleteItem(rowData.id)">Delete</va-button>
      </template>
    </va-data-table>

    <va-modal v-model="showModal" title="Group">
      <va-input v-model="form.name" label="Name" class="mb-3" />
      <va-input v-model.number="form.display_order" type="number" label="Display Order" class="mb-3" />
      <va-checkbox v-model="form.show_on_dashboard" label="Show on Dashboard" class="mb-3" />

      <template #footer>
        <va-button @click="saveItem">Save</va-button>
      </template>
    </va-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getGroups, createGroup, updateGroup, deleteGroup } from '@/services/api';

const groups = ref([]);
const showModal = ref(false);
const form = ref({ name: '', display_order: 0, show_on_dashboard: true });
const editingId = ref(null);

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'display_order', label: 'Order' },
  { key: 'show_on_dashboard', label: 'On Dashboard' },
  { key: 'actions', label: 'Actions' }
];

async function fetchData() {
  const res = await getGroups();
  groups.value = res.data;
}

function editItem(item) {
  form.value = { ...item };
  editingId.value = item.id;
  showModal.value = true;
}

async function saveItem() {
  if (editingId.value) {
    await updateGroup(editingId.value, form.value);
  } else {
    await createGroup(form.value);
  }
  showModal.value = false;
  form.value = { name: '', display_order: 0, show_on_dashboard: true };
  editingId.value = null;
  fetchData();
}

async function deleteItem(id) {
  if (confirm('Delete this group?')) {
    await deleteGroup(id);
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
