<template>
  <div class="setup-container">
    <va-card class="setup-card">
      <va-card-title>First-Time Setup</va-card-title>
      <va-card-content>
        <p class="mb-4">Create the admin account to get started.</p>
        <form @submit.prevent="handleSetup">
          <va-input
            v-model="username"
            label="Admin Username"
            class="mb-4"
          />
          <va-input
            v-model="password"
            type="password"
            label="Admin Password"
            class="mb-4"
          />
          <va-input
            v-model="confirmPassword"
            type="password"
            label="Confirm Password"
            class="mb-4"
            :error="!!error"
            :error-messages="error ? [error] : []"
          />
          <va-button type="submit" :loading="loading" class="w-full">
            Create Admin
          </va-button>
        </form>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { setupAdmin } from '@/services/api';

const router = useRouter();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');

async function handleSetup() {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    await setupAdmin({ username: username.value, password: password.value });
    router.push('/login');
  } catch (err) {
    error.value = err.response?.data?.error || 'Setup failed';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.setup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.setup-card {
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
