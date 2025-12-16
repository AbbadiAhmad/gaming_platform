<template>
  <div class="login-container">
    <va-card class="login-card">
      <va-card-title>Game Scoring Dashboard</va-card-title>
      <va-card-content>
        <form @submit.prevent="handleLogin">
          <va-input
            v-model="username"
            label="Username"
            class="mb-4"
            :error="!!error"
          />
          <va-input
            v-model="password"
            type="password"
            label="Password"
            class="mb-4"
            :error="!!error"
            :error-messages="error ? [error] : []"
          />
          <va-button type="submit" :loading="loading" class="w-full">
            Login
          </va-button>
        </form>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { checkSetupNeeded } from '@/services/api';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

// Check if setup is needed
checkSetupNeeded().then(res => {
  if (res.data.needed) {
    router.push('/setup');
  }
});

async function handleLogin() {
  loading.value = true;
  error.value = '';

  try {
    await authStore.login(username.value, password.value);
    router.push('/admin');
  } catch (err) {
    error.value = 'Invalid credentials';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.w-full {
  width: 100%;
}

.mb-4 {
  margin-bottom: 1rem;
}
</style>
