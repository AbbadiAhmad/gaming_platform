<template>
  <div class="admin-layout">
    <va-sidebar v-model="sidebarVisible" class="sidebar">
      <va-sidebar-item>
        <va-sidebar-item-title>Admin Panel</va-sidebar-item-title>
      </va-sidebar-item>

      <va-sidebar-item :to="'/admin/groups'" :active="$route.path === '/admin/groups'">
        <va-sidebar-item-content>
          <va-icon name="group" />
          <span>Groups</span>
        </va-sidebar-item-content>
      </va-sidebar-item>

      <va-sidebar-item :to="'/admin/teams'" :active="$route.path === '/admin/teams'">
        <va-sidebar-item-content>
          <va-icon name="people" />
          <span>Teams</span>
        </va-sidebar-item-content>
      </va-sidebar-item>

      <va-sidebar-item :to="'/admin/games'" :active="$route.path === '/admin/games'">
        <va-sidebar-item-content>
          <va-icon name="sports_esports" />
          <span>Games</span>
        </va-sidebar-item-content>
      </va-sidebar-item>

      <va-sidebar-item :to="'/admin/place-scores'" :active="$route.path === '/admin/place-scores'">
        <va-sidebar-item-content>
          <va-icon name="emoji_events" />
          <span>Place Scores</span>
        </va-sidebar-item-content>
      </va-sidebar-item>

      <va-sidebar-item :to="'/admin/users'" :active="$route.path === '/admin/users'">
        <va-sidebar-item-content>
          <va-icon name="person" />
          <span>Users</span>
        </va-sidebar-item-content>
      </va-sidebar-item>

      <va-divider />

      <va-sidebar-item :to="'/evaluate'">
        <va-sidebar-item-content>
          <va-icon name="edit" />
          <span>Evaluate</span>
        </va-sidebar-item-content>
      </va-sidebar-item>

      <va-sidebar-item :to="'/dashboard'">
        <va-sidebar-item-content>
          <va-icon name="dashboard" />
          <span>Dashboard</span>
        </va-sidebar-item-content>
      </va-sidebar-item>

      <va-sidebar-item @click="handleLogout">
        <va-sidebar-item-content>
          <va-icon name="logout" />
          <span>Logout</span>
        </va-sidebar-item-content>
      </va-sidebar-item>
    </va-sidebar>

    <div class="admin-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const sidebarVisible = ref(true);

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background: #2c3e50;
}

.admin-content {
  flex: 1;
  padding: 2rem;
  background: #ecf0f1;
}
</style>
