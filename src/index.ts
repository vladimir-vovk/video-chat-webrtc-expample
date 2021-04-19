import express from 'express'
import http from 'http'
import socket from 'socket.io'
import { v4 } from 'uuid'

const port = process.env.PORT || 3000
const app = express()
const server = http.createServer(app)
const io = new socket.Server(server)

app.set('view engine', 'ejs')
app.set('views', './src/views')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${v4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    console.log('join-room', roomId)
    console.log('user-connected', userId)

    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId)

    socket.on('disconnect', () => {
      console.log('user-disconnected', userId)
      socket.to(roomId).emit('user-disconnected', userId)
    })
  })
})

server.listen(port, () => {
  console.log(`Listening on port ${port}...`)
})
