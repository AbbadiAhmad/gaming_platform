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
  try {
    const res = await getGroups();
    groups.value = res.data;
  } catch (error) {
    console.error('Error fetching groups:', error);
    alert('Failed to load groups.');
  }
}

function editItem(item) {
  form.value = { ...item, show_on_dashboard: !!item.show_on_dashboard };
  editingId.value = item.id;
  showModal.value = true;
}

async function saveItem() {
  try {
    if (!form.value.name || !form.value.name.trim()) {
      alert('Name is required');
      return;
    }

    // Convert boolean to integer for SQLite
    const payload = {
      name: form.value.name,
      display_order: Number(form.value.display_order),
      show_on_dashboard: form.value.show_on_dashboard ? 1 : 0
    };

    console.log('Saving group:', payload);

    if (editingId.value) {
      await updateGroup(editingId.value, payload);
    } else {
      await createGroup(payload);
    }

    showModal.value = false;
    form.value = { name: '', display_order: 0, show_on_dashboard: true };
    editingId.value = null;
    await fetchData();
    console.log('Group saved successfully!');
  } catch (error) {
    console.error('Error saving group:', error);
    const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
    alert(`Failed to save group: ${errorMsg}`);
  }
}

async function deleteItem(id) {
  if (!confirm('Delete this group?')) return;

  try {
    await deleteGroup(id);
    await fetchData();
  } catch (error) {
    console.error('Error deleting group:', error);
    alert(error.response?.data?.error || 'Failed to delete group.');
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
