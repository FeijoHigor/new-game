const socketio = require('socket.io')
const express = require('express')

const gameFc = require('./game')

const http = require('http')

const app = express()

const server = http.createServer(app)

const io = socketio(server, {
    cors: {
        origin: '*'
    },
})

const game = gameFc.game()
console.log(game.state)

io.on('connection', (socket) => {

    const checkRoom = (id) => {
        var index = -1
        game.state['rooms'].forEach((e, i) => {
            if(e.id == id) {
                index = {e, i}
            }
        })

        return index
    }

    const checkPlayer = (id, array) => {
        var index = -1
        array.forEach((e, i) => {
            if(e.id == id) {
                index = {e, i}
            }
        })

        return index
    }

    const getRoomId = (socketId) => {
        var room = -1

        game.state['rooms'].forEach((e, i) => {
            if(e.gameScreen == socketId) {
                room = {room: e.id, iRoom: i, type: 'screen'}
            }
        })

        if(room == -1) {
            game.state['rooms'].forEach((eRoom, iRoom) => {
                eRoom.players.forEach((ePlayer, iPlayer) => {
                    if(ePlayer.id == socketId) {
                        room = {room: eRoom.id, iRoom: iRoom, iPlayer: iPlayer, type: 'control'}
                    }
                })
            })
        }

        return room
    }

    function callSoocket(socketType, socketParams) {

        const params = socketParams

        if(socketType == 'updateState') {
            socket.to(params.room).emit('state', {state: params.state})
        }else if(socketType == 'startGame') {
            socket.to(params.room).emit('startGame', {room: params.room})
        }else if(socketType == 'joinRoom') {
            socket.join(params.roomId)
            if(params.socketType == 'player') {
                socket.to(params.roomId).emit('playerEntered', {room: params.roomId})
            }
        }else if(socketType == 'leaveScreen') {
            socket.to(params.room).emit('leavePlayers', {room: params.room})
        }else if(socketType == 'createRoom') {
            socket.emit('createdRoom', {roomId: params.roomId})
        }
    }

    socket.on('keyPress', (params) => {
        console.log('key ', params.key, ' was pressed')
        if(params.key === 'i') {
            console.log(game.state['rooms'])
        }else if (params.key == 'p') {
            const roomId = Array.from(socket.rooms)[1]
            console.log(checkRoom(roomId)['e']['players'])
        }
    })


    socket.on('btnPressed', (params) => {
        const btnPressed = params.btn
        const room = getRoomId(socket.id)

        game.btnPressed({ socket: socket.id, room, btnPressed, callSoocket: callSoocket })
    })

    socket.on('createRoom', (params) => {
        game.createRoom({ socket, callSoocket, })
    })

    socket.on('enterRoom', (params) => {
        const room = checkRoom(params.roomId)

        game.enterPlayer({socketId: socket.id, room, callSoocket})
    })

    socket.on('disconnect', () => {
        const room = getRoomId(socket.id)
        
        game.leavePlayer({socketId: socket.id, callSoocket, room})
    })
})

app.get('/', (req, res) => {
    res.send('hello')
})

const PORT = 3003

server.listen(PORT, () => {
    console.log('Server is running')
})

module.exports = {}