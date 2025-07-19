<template>
  <div class="container">

    <!-- Logo Image -->
    <img src="../assets/Wlcome.png" alt="App Logo" class="logo" />

    <div v-if="connected && !usernameSent && !loading" class="form-card">
      <h2 class="title">Welcome!</h2>
      <p class="subtitle">Enter your username to continue</p>
      <form @submit.prevent="submitUsername" class="form">
        <input 
          v-model="username" 
          type="text" 
          placeholder="Enter username" 
          class="input"
          required
        />
        <button type="submit" class="button">
          Continue
        </button>
      </form>
    </div>

    <div v-if="loading" class="loading-card">
      <div class="spinner"></div>
      <p class="loading-text">Connecting...</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import socket from '../socket.js'
import { useRouter } from 'vue-router'

const connected = ref(false)
const username = ref('')
const usernameSent = ref(false)
const loading = ref(false)
const router = useRouter()

onMounted(() => {
  socket.on('connect', () => {
    connected.value = true
  })
  
  socket.on('disconnect', () => {
    connected.value = false
  })
})

function submitUsername() {
  if (username.value.trim()) {
    loading.value = true
    socket.emit('username', username.value)
    usernameSent.value = true
    
    setTimeout(() => {
      loading.value = false
      router.push('/voting')
    }, 1000)
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F5F5F5;
  padding: 20px;
}

.form-card, .success-card, .loading-card, .connection-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.subtitle {
  color: #718096;
  margin: 0 0 32px 0;
  font-size: 16px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input {
  padding: 16px;
  font-size: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  transition: all 0.2s ease;
}

.input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.button {
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: #48bb78;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  transform: translateY(-2px);
}

.success-card {
  color: #2d3748;
}

.success-icon {
  font-size: 48px;
  color: #48bb78;
  margin-bottom: 16px;
}

.success-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #2d3748;
}
  
.loading-card {
  color: #2d3748;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px auto;
}

.loading-text {
  color: #718096;
  margin: 0;
  font-size: 16px;
}

.connection-card {
  color: #2d3748;
}

.connection-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.connection-text {
  color: #718096;
  margin: 0;
  font-size: 16px;
}
.logo {
  width: 199px;
  margin-bottom: 15px;
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>