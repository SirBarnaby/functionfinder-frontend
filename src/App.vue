<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink, RouterView } from 'vue-router'
import LocationFilter from './components/LocationFilter.vue'
import EventList from './components/EventList.vue'
import AuthModal from './components/AuthModal.vue'
import { useAuthStore } from './stores/authStore';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { isAuthenticated, user } = storeToRefs(authStore);
const showAuthModal = ref(false);
const authMode = ref<'login' | 'register'>('login');

const openLogin = () => {
  authMode.value = 'login';
  showAuthModal.value = true;
};

const openRegister = () => {
  authMode.value = 'register';
  showAuthModal.value = true;
};

const closeAuthModal = () => {
  showAuthModal.value = false;
};

const handleLogout = () => {
  authStore.logout();
};

onMounted(() => {
  // Initialize auth state from localStorage if available
  authStore.initializeAuth();
  
  // Listen for custom event to open auth modal from child components
  window.addEventListener('open-auth-modal', ((event: CustomEvent) => {
    const { mode } = event.detail;
    authMode.value = mode;
    showAuthModal.value = true;
  }) as EventListener);
});

// Clean up event listener on component unmount
onUnmounted(() => {
  window.removeEventListener('open-auth-modal', (() => {}) as EventListener);
});
</script>

<template>
  <div class="app">
    <header>
      <h1>Function Finder</h1>
      <div class="auth-buttons">
        <template v-if="isAuthenticated">
          <span class="username">{{ user?.username }}</span>
          <button class="auth-button logout" @click="handleLogout">Logout</button>
        </template>
        <template v-else>
          <button class="auth-button login" @click="openLogin">Login</button>
          <button class="auth-button register" @click="openRegister">Register</button>
        </template>
      </div>
    </header>
    <main>
      <LocationFilter />
      <EventList />
    </main>
    <AuthModal 
      :is-open="showAuthModal" 
      :initial-mode="authMode" 
      @close="closeAuthModal" 
    />
  </div>
</template>

<style>
:root {
  --bg-primary: #1a1a1a;
  --bg-secondary: #242424;
  --bg-tertiary: #2a2a2a;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --text-tertiary: #808080;
  --accent-color: #ff4444;
  --accent-hover: #ff2222;
  --border-color: #333333;
  --input-bg: #2f2f2f;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  min-height: 100vh;
}

.app {
  min-height: 100vh;
}

header {
  background-color: var(--bg-secondary);
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  color: var(--accent-color);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

main {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

button {
  cursor: pointer;
  font-family: inherit;
}

input, select {
  font-family: inherit;
  color: var(--text-primary);
  background-color: var(--input-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.5rem;
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(255, 68, 68, 0.1);
}

select {
  appearance: none;
  padding-right: 2rem;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23808080' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
}

select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--bg-secondary);
}

::placeholder {
  color: var(--text-tertiary);
}

.auth-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.auth-button {
  background-color: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.auth-button.login:hover {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.auth-button.register {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.auth-button.register:hover {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}

.auth-button.logout {
  background-color: transparent;
  border-color: var(--border-color);
}

.auth-button.logout:hover {
  background-color: var(--bg-tertiary);
}

.username {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-right: 5px;
}
</style>
