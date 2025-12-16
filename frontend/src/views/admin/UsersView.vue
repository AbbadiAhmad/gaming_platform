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
  try {
    const res = await getUsers();
    users.value = res.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    alert('Failed to load users. Check console for details.');
  }
}

function editItem(item) {
  form.value = { username: item.username, role: item.role, active: !!item.active };
  editingId.value = item.id;
  showModal.value = true;
}

async function saveItem() {
  try {
    if (!form.value.username || !form.value.username.trim()) {
      alert('Username is required');
      return;
    }
    if (!editingId.value && (!form.value.password || !form.value.password.trim())) {
      alert('Password is required for new users');
      return;
    }

    const payload = {
      username: form.value.username,
      role: form.value.role,
      active: form.value.active ? 1 : 0
    };

    if (form.value.password) {
      payload.password = form.value.password;
    }

    if (editingId.value) {
      await updateUser(editingId.value, payload);
    } else {
      await createUser(payload);
    }

    showModal.value = false;
    form.value = { username: ', password: ', role: 'evaluator', active: true };
    editingId.value = null;
    await fetchData();
  } catch (error) {
    console.error('Error saving user:', error);
    alert(error.response?.data?.error || 'Failed to save user.');
  }
}

async function deleteItem(id) {
  if (!confirm('Delete this user?')) return;

  try {
    await deleteUser(id);
    await fetchData();
  } catch (error) {
    console.error('Error deleting user:', error);
    alert(error.response?.data?.error || 'Failed to delete user. Check console for details.');
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
