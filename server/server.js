const express = require('express')
const http = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*'
  }
})

const users = {}        // socket.id => username
const userVotes = {}    // socket.id => vote

function broadcastUsers() {
  const usernames = Object.values(users)
  io.emit('update-users', usernames)
}

function broadcastVotes() {
  const voteList = Object.entries(userVotes).map(([socketId, vote]) => ({
    username: users[socketId] || 'Anonymous',
    vote
  }))
  io.emit('vote-update', voteList)
}

io.on('connection', (socket) => {
  socket.on('username', (username) => {
    users[socket.id] = username
    broadcastUsers()
  })

  socket.on('request-username', () => {
    const username = users[socket.id]
    socket.emit('send-username', username)
  })

  socket.on('cast-vote', (value) => {
    const numericValue = parseInt(value)
    if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 6) {
      userVotes[socket.id] = numericValue
      broadcastVotes()
    }
  })

  socket.on('chat-message', (message) => {
    const username = users[socket.id] || 'Anonymous'
    const fullMessage = `${username}: ${message}`
    io.emit('chat-message', fullMessage)
  })

  socket.on('disconnect', () => {
    
    delete users[socket.id]
    delete userVotes[socket.id]
    broadcastUsers()
    broadcastVotes()
  })
})

server.listen(4000, () => {
  console.log('Server running at http://localhost:4000')
})
