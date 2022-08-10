const socketio = require('socket.io')
const express = require('express')

const http = require('http')

const app = express()

const server = http.createServer(app)

const io = socketio(server, {
    cors: {
        origin: '*'
    },
})

io.on('connection', (socket) => {
    console.log('hello', socket.id)

    socket.on('keyPress', (params) => {
        console.log('key ', params.key, ' was pressed')
    })

})

app.get('/', (req, res) => {
    res.send('hello')
})

const PORT = 3003

server.listen(PORT, () => {
    console.log('Server is running')
})