<template>
  <div class="app">
    <div v-if="username" class="container">
      <h1>You're in! Welcome.</h1>
      <p class="welcome">Hi, {{ username }}!</p>
      
      <div class="grid">

        <!-- Voting Section -->
        <div class="card">
          <h3>Select Your Number</h3>
          <div class="vote-buttons">
            <button 
              v-for="num in 6" 
              :key="num"
              @click="castVote(num)"
              class="vote-btn"
              :class="{ active: myVote === num }"
            >
              {{ num }}
            </button>
          </div> 
          
          <div class="average">
            Average: {{ averageVote }}
          </div>
          
          <div v-if="votes.length > 0" class="votes-list">
            <h4>Votes:</h4>
            <div 
              v-for="(vote, index) in votes" 
              :key="index" 
              class="vote-item"
              :class="{ 'my-vote': vote.username === username }"
            >
              {{ vote.username }}: 
              <span v-if="vote.username === username">{{ vote.vote }}</span>
              <span v-else>voted</span>
            </div>
          </div>
        </div>

        <!-- Users Section -->
        <div class="card">
          <h3>Connected Users</h3>
          <ul class="user-list">
            <li 
              v-for="(user, index) in connectedUsers" 
              :key="index"
            >
              👤 {{ user }} <span v-if="user === username">(You)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Chat Button -->
    <button class="chat-toggle" @click="toggleChat">
      💬 
    </button>
    <transition name="slide-up">
      <div v-if="chatVisible" class="chat-panel">
        <h3>Live Chat</h3>
        <div class="chat-box" ref="chatBox">
          <div v-for="(msg, index) in chatMessages" :key="index">
            {{ msg }}
          </div>
        </div>
        <input 
          v-model="chatInput" 
          @keyup.enter="sendMessage" 
          placeholder="Type your message..."
          class="chat-input"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import socket from '../socket.js'

const router = useRouter()
const username = ref('')
const connectedUsers = ref([])
const chatMessages = ref([])
const chatInput = ref('')
const votes = ref([])
const myVote = ref(null)
const chatVisible = ref(false)
const chatBox = ref(null)

//  Computed average vote
const averageVote = computed(() => {
  if (votes.value.length === 0) return '0.00'
  const sum = votes.value.reduce((acc, cur) => acc + cur.vote, 0)
  return (sum / votes.value.length).toFixed(2)
})

// Auto-scroll chat to bottom
const scrollChatToBottom = async () => {
  if (chatBox.value) {
    await nextTick()
    chatBox.value.scrollTop = chatBox.value.scrollHeight
  }
}

//  Lifecycle: When component mounts
onMounted(() => {
  // Check if socket is connected first
  if (!socket.connected) {
    socket.connect()
  }

  socket.emit('request-username') // Ask for username from server

  //  Receive username from server
  socket.on('send-username', (name) => {
    if (!name || name.trim() === '') {
      router.push('/')
    } else {
      username.value = name
      //  Send it back to server (ensures user is registered)
      socket.emit('username', name)
    }
  })

  // Update user list
  socket.on('update-users', (userList) => {
    if (Array.isArray(userList)) {
      connectedUsers.value = userList
      console.log(' Updated user list:', userList)
    }
  })

  // Update vote list
  socket.on('vote-update', (updatedVotes) => {
    if (Array.isArray(updatedVotes)) {
      votes.value = updatedVotes
    }
  })

  // Chat messages
  socket.on('chat-message', (message) => {
    if (message) {
      chatMessages.value.push(message)
      scrollChatToBottom()
    }
  })

  // Handle connection errors
  socket.on('connect_error', () => {
    console.error('Socket connection failed')
    // Could redirect to home or show error message
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected')
  })
})

// Cleanup listeners
onUnmounted(() => {
  socket.off('send-username')
  socket.off('update-users')
  socket.off('vote-update')
  socket.off('chat-message')
  socket.off('connect_error')
  socket.off('disconnect')
})

//  Emit vote
function castVote(value) {
  if (value && value >= 1 && value <= 6) {
    myVote.value = value
    socket.emit('cast-vote', value)
  }
}

//  Send chat message
function sendMessage() {
  if (chatInput.value && chatInput.value.trim()) {
    socket.emit('chat-message', chatInput.value.trim())
    chatInput.value = ''
  }
}

// Toggle chat box visibility
function toggleChat() {
  chatVisible.value = !chatVisible.value
  if (chatVisible.value) {
    scrollChatToBottom()
  }
}
</script>
<style scoped>
.app {
  min-height: 100vh;
  background-color: #F5F5F5;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 10px;
}

h1 {
  text-align: center;
  color: #2d3748;
  font-size: 2.2rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.welcome {
  text-align: center;
  color: #4a5568;
  font-size: 1.1rem;
  margin-bottom: 10%;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 80px;
  justify-items: center;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  width: 100%;
  max-width: 500px;
  margin-bottom: 20px;
}

.card h3 {
  margin-bottom: 15px;
  color: #2d3748;
  font-size: 1.2rem;
  font-weight: 600;
}

.vote-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 30px;
  margin-bottom: 15px;
}

.vote-btn {
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 9px;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.vote-btn:hover {
  background: #38a169;
}

.vote-btn.active {
  background: #2f855a;
  box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.3);
}

.average {
  background: #edf2f7;
  padding: 12px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  text-align: center;
  margin-bottom: 20px;
}

.votes-list h4 {
  margin-bottom: 10px;
  color: #4a5568;
  font-size: 1rem;
}

.vote-item {
  padding: 8px 12px;
  margin: 6px 0;
  background: #f7fafc;
  border-radius: 6px;
  color: #4a5568;
  font-size: 0.95rem;
}

.vote-item.my-vote {
  background: #f0fff4;
  color: #2f855a;
  font-weight: 600;
  border: 1px solid #c6f6d5;
}

.user-list {
  list-style: none;
  padding-left: 0;
  margin-top: 10px;
}

.user-list li {
  background: #f7fafc;
  padding: 10px 14px;
  margin: 6px 0;
  border-radius: 6px;
  color: #2d3748;
  font-weight: 500;
  font-size: 0.95rem;
  word-break: break-word;
}

/* Chat toggle button */
.chat-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 12px 18px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

/* Chat panel */
.chat-panel {
  position: fixed;
  bottom: 70px;
  right: 20px;
  width: 90vw;
  max-width: 320px;
  max-height: 80vh;
  background: white;
  border: 1px solid #cbd5e0;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  padding: 15px;
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.chat-panel h3 {
  margin: 0 0 10px;
  font-size: 1rem;
  color: #2d3748;
}

.chat-box {
  flex-grow: 1;
  overflow-y: auto;
  background: #f7fafc;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: #4a5568;
  max-height: 200px;
}

.chat-input {
  padding: 10px;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  width: 90%;
}

/* Chat transition animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Media Queries for Responsive Layout */
@media (max-width: 768px) {
  .container {
    max-width: 100%;
    padding: 0 10px;
  }

  h1 {
    font-size: 1.8rem;
  }

  .welcome {
    font-size: 1rem;
    margin-bottom: 20px;
  }

  .grid {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .card {
    width: 95%;
    padding: 20px;
    max-width: 500px;
  }

  .vote-btn {
    padding: 12px;
    font-size: 20px;
  }

  .chat-toggle {
    font-size: 14px;
    padding: 10px 14px;
  }

  .chat-panel {
    right: 10px;
    width: 95vw;
    max-width: none;
  }
}
</style>