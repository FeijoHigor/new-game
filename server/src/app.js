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

const game = {
    rooms: []
}

io.on('connection', (socket) => {

    socket.on('keyPress', (params) => {
        console.log('key ', params.key, ' was pressed')
        if(params.key === 'i') {
            console.log(game)
        }else if(params.key === 'c') {
            game['rooms'] = []
        }
    })


    socket.on('btnPressed', (params) => {
        const btnPressed = params.btn

        console.log(btnPressed)
    })

    socket.on('createRoom', (params) => {
        const newRoom = params.roomId
        if(game['rooms'].indexOf(newRoom) > 0) {
            socket.emit('roomExists', {roomId: newRoom})
        }else {
            const room = {id: newRoom, gameScreen: socket.id, gameControl: 0}
            game['rooms'].push(room)

            socket.join(newRoom)
            socket.emit('createdRoom', {roomId: newRoom})

            console.log('New room was created: ', newRoom)
            console.log('Waiting control enter')
        }
    })
})

app.get('/', (req, res) => {
    res.send('hello')
})

const PORT = 3003

server.listen(PORT, () => {
    console.log('Server is running')
})