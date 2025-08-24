<template>
  <div class="container">
    <!-- Logo -->
    <img 
      src="../assets/Welcome.png" 
      alt="App Logo" 
      class="logo" 
      @load="handleImageLoad"
      @error="handleImageError"
    />

    <!-- Loading -->
    <div v-if="loading" class="card">
      <div class="spinner"></div>
      <p class="loading-text">Getting Server Ready...</p>
    </div>

    <!-- Username Form -->
    <div v-else-if="connected && !usernameSent" class="card">
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
        <button type="submit" class="button">Continue</button>
      </form>
    </div>

    <!-- Connection Error (only addition for better UX) -->
    <div v-else-if="!connected && !loading" class="card">
      <h2 class="title">Connection Error</h2>
      <p class="subtitle">Unable to connect to server. Please refresh the page.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import socket from '../socket.js'
import { useRouter } from 'vue-router'

const connected = ref(false)
const username = ref('')
const usernameSent = ref(false)
const loading = ref(true)
const imageLoaded = ref(false)
const router = useRouter()

let loadingTimeout = null

// Make sure we show loading until both ready
const tryFinishLoading = () => {
  if (connected.value && imageLoaded.value) {
    loading.value = false
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
      loadingTimeout = null
    }
  }
}

const setupSocketListeners = () => {
  socket.on('connect', () => {
    connected.value = true
    tryFinishLoading()
  })

  socket.on('disconnect', () => {
    connected.value = false
    if (!usernameSent.value) {
      loading.value = true
    }
  })

  socket.on('connect_error', () => {
    connected.value = false
    loading.value = false
  })
}

onMounted(() => {
  setupSocketListeners()

  // Check if socket is already connected (fixes reload issues)
  if (socket.connected) {
    connected.value = true
    tryFinishLoading()
  }

  // Fallback: if something breaks, remove loading after 5s
  loadingTimeout = setTimeout(() => {
    loading.value = false
  }, 10000)
})

onUnmounted(() => {
  if (loadingTimeout) {
    clearTimeout(loadingTimeout)
    loadingTimeout = null
  }
  
  // Clean up socket listeners to prevent memory leaks
  socket.off('connect')
  socket.off('disconnect')
  socket.off('connect_error')
})

function handleImageLoad() {
  imageLoaded.value = true
  tryFinishLoading()
}

function handleImageError() {
  // Still proceed even if image fails to load
  imageLoaded.value = true
  tryFinishLoading()
}

function submitUsername() {
  if (username.value.trim()) {
    loading.value = true
    socket.emit('username', username.value.trim())
    usernameSent.value = true

    setTimeout(() => {
      router.push('/voting')
    }, 1000)
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* vertically center */
  min-height: 100vh;
  min-height: 100dvh; /* Better mobile viewport support */
  background: #f5f5f5;
  padding: 20px;
  text-align: center;
  box-sizing: border-box;
}

/* Logo styling */
.logo {
  width: 160px;
  height: auto; /* Maintain aspect ratio */
  margin-bottom: 20px;
}

/* Card (both loading and form) */
.card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 32px;
  text-align: center;
  box-sizing: border-box; /* Fix padding issues */
}

/* Spinner */
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Typography */
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
}

.subtitle {
  color: #666;
  margin-bottom: 24px;
}

.loading-text {
  color: #666;
  margin: 0;
}

/* Form Elements */
.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input {
  padding: 14px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 12px;
  width: 100%; /* Full width */
  box-sizing: border-box; /* Include padding in width */
}

.button {
  padding: 14px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  background-color: #48bb78;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%; /* Full width */
  box-sizing: border-box; /* Include padding in width */
}

.button:hover {
  background-color: #38a169;
}

/* Mobile Optimizations - Enhanced */
@media (max-width: 768px) {
  .container {
    padding: 16px; /* Slightly less padding on mobile */
    min-height: 100vh;
    min-height: 100dvh; /* Dynamic viewport height for mobile */
  }

  .card {
    max-width: 100%; /* Full width on very small screens */
    padding: 24px;
    margin: 0 8px; /* Small side margins */
  }

  .logo {
    width: 130px;
  }
}

/* Very small screens */
@media (max-width: 480px) {
  .container {
    padding: 12px;
  }
  
  .card {
    padding: 20px;
    margin: 0;
  }
  
  .logo {
    width: 120px;
  }
  
  .title {
    font-size: 22px;
  }
  
  .input, .button {
    font-size: 16px; /* Prevent zoom on iOS */
  }
}

/* Landscape mobile */
@media (max-height: 500px) and (orientation: landscape) {
  .container {
    justify-content: flex-start;
    padding-top: 20px;
  }
  
  .logo {
    width: 100px;
    margin-bottom: 16px;
  }
}
</style>