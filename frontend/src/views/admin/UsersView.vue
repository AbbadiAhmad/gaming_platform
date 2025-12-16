<template>
  <div>
    <h1>Users Management</h1>

    <va-button @click="showModal = true" class="mb-4">Add User</va-button>

    <va-data-table :items="users" :columns="columns">
      <template #cell(active)="{ value }">
        {{ value ? 'Active' : 'Inactive' }}
      </template>
      <template #cell(actions)="{ rowData }">
        <va-button size="small" @click="editItem(rowData)" class="mr-2">Edit</va-button>
        <va-button size="small" color="danger" @click="deleteItem(rowData.id)">Delete</va-button>
      </template>
    </va-data-table>

    <va-modal v-model="showModal" title="User">
      <va-input v-model="form.username" label="Username" class="mb-3" />
      <va-input v-if="!editingId" v-model="form.password" type="password" label="Password" class="mb-3" />
      <va-select v-model="form.role" label="Role" :options="['admin', 'evaluator']" class="mb-3" />
      <va-checkbox v-model="form.active" label="Active" class="mb-3" />

      <template #footer>
        <va-button @click="saveItem">Save</va-button>
      </template>
    </va-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUsers, createUser, updateUser, deleteUser } from '@/services/api';

const users = ref([]);
const showModal = ref(false);
const form = ref({ username: '', password: '', role: 'evaluator', active: true });
const editingId = ref(null);

const columns = [
  { key: 'username', label: 'Username' },
  { key: 'role', label: 'Role' },
  { key: 'active', label: 'Status' },
  { key: 'actions', label: 'Actions' }
];

async function fetchData() {
  const res = await getUsers();
  users.value = res.data;
}

function editItem(item) {
  form.value = { username: item.username, role: item.role, active: !!item.active };
  editingId.value = item.id;
  showModal.value = true;
}

async function saveItem() {
  if (editingId.value) {
    await updateUser(editingId.value, form.value);
  } else {
    await createUser(form.value);
  }
  showModal.value = false;
  form.value = { username: '', password: '', role: 'evaluator', active: true };
  editingId.value = null;
  fetchData();
}

async function deleteItem(id) {
  if (confirm('Delete this user?')) {
    await deleteUser(id);
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
