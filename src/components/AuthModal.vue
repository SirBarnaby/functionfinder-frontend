<template>
  <div class="auth-modal-overlay" v-if="isOpen">
    <div class="auth-modal">
      <div class="auth-modal-header">
        <h2>{{ isLogin ? 'Login' : 'Register' }}</h2>
        <button class="close-button" @click="close">×</button>
      </div>
      
      <div class="auth-modal-body">
        <div v-if="authStore.error" class="auth-error">
          {{ authStore.error }}
        </div>
        
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              v-model="username" 
              required
              autocomplete="username"
            />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              required
              autocomplete="current-password"
            />
          </div>
          
          <div class="auth-actions">
            <button 
              type="submit" 
              class="auth-submit" 
              :disabled="authStore.loading"
            >
              <span v-if="authStore.loading">Processing...</span>
              <span v-else>{{ isLogin ? 'Login' : 'Register' }}</span>
            </button>
          </div>
        </form>
        
        <div class="auth-switch">
          <p v-if="isLogin">
            Don't have an account?
            <a href="#" @click.prevent="switchMode">Register</a>
          </p>
          <p v-else>
            Already have an account?
            <a href="#" @click.prevent="switchMode">Login</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from 'vue';
import { useAuthStore } from '../stores/authStore';

const props = defineProps<{
  isOpen: boolean;
  initialMode?: 'login' | 'register';
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

const authStore = useAuthStore();
const isLogin = ref(props.initialMode === 'register' ? false : true);
const username = ref('');
const password = ref('');

const close = () => {
  emit('close');
};

const switchMode = () => {
  isLogin.value = !isLogin.value;
  username.value = '';
  password.value = '';
  authStore.error = null;
};

const submitForm = async () => {
  if (!username.value || !password.value) return;
  
  let success;
  if (isLogin.value) {
    success = await authStore.login(username.value, password.value);
  } else {
    success = await authStore.register(username.value, password.value);
  }
  
  if (success) {
    emit('success');
    emit('close');
  }
};
</script>

<style scoped>
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.auth-modal {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.auth-modal-header {
  padding: 16px 20px;
  background-color: var(--bg-tertiary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.auth-modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.auth-modal-body {
  padding: 20px;
}

.auth-error {
  background-color: rgba(255, 68, 68, 0.1);
  border-left: 3px solid var(--accent-color);
  color: var(--accent-color);
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

input {
  width: 100%;
}

.auth-actions {
  margin-top: 24px;
}

.auth-submit {
  width: 100%;
  background-color: var(--accent-color);
  color: white;
  border: none;
  padding: 12px;
  font-size: 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.auth-submit:hover:not(:disabled) {
  background-color: var(--accent-hover);
}

.auth-submit:disabled {
  background-color: var(--bg-tertiary);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.auth-switch {
  margin-top: 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.auth-switch a {
  color: var(--accent-color);
  text-decoration: none;
}

.auth-switch a:hover {
  text-decoration: underline;
}
</style>
