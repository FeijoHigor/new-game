const socketio = require('socket.io')
const http = require('http')
const express = require('express')
const gameFc = require('./src/game')

require('dotenv').config()

const app = express()

const server = http.createServer(app)

app.use('/static', express.static('public'))

const io = socketio(server)

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

        if(room == -1) {
            game.state['rooms'].forEach((eRoom, iRoom) => {
                eRoom.viewers.forEach((eViewer, iViewer) => {
                    if(eViewer == socketId) {
                        room = {room: eRoom.id, iRoom: iRoom, iViewer: iViewer, type: 'viewer'}
                    }
                })
            })
        }

        return room
    }

    const sendToViewers = (roomId, socketType, socketParams) => {
        const room = checkRoom(roomId)
        if(room != -1) {
            room.e.viewers.forEach((e, i) => {
                socket.to(e).emit(socketType, socketParams)
            })
        }
    }

    function callSocket(socketType, socketParams) {

        const params = socketParams

        
        if(socketType == 'updateState') {
            socket.emit('state', {state: params.state})
            socket.to(params.room).emit('state', {state: params.state})
            sendToViewers(params.room, 'state', {state: params.state})
        }else if(socketType == 'startGame') {
            socket.to(params.room.room).emit('startGame', {room: params.room})
            socket.emit('startGame', {room: params.room})
        }else if(socketType == 'joinRoom') {
            socket.join(params.roomId)
            if(params.socketType == 'player') {
                socket.to(params.roomId).emit('playerEntered', {room: params.roomId})
                sendToViewers(params.roomId, 'playerEntered', {room: params.roomId})
            }
        }else if(socketType == 'leaveScreen') {
            socket.to(params.room).emit('leavePlayers', {room: params.room})
            sendToViewers(params.room, 'leavePlayers', {room: params.room})
        }else if(socketType == 'createRoom') {
            socket.emit('createdRoom', {room: params.room})
        }else if(socketType == 'playerStatus') {
            if(params.playerStatus.e.id == socket.id) {
                socket.emit('playerStatus', {playerStatus: params.playerStatus, preset: params.preset})
            }else {
                socket.to(params.playerStatus.e.id).emit('playerStatus', {playerStatus: params.playerStatus, preset: params.preset})
            }
        }else if(socketType == 'fruitStatus') {
            socket.to(params.room).emit('state', {state: params.state})
            sendToViewers(params.room, 'state', {state: params.state})
        }else if(socketType == 'countStatus') {
            socket.to(params.room.room).emit('countStatus', {room: params.room, running: params.running})
            socket.emit('countStatus', {room: params.room, running: params.running})
            sendToViewers(params.room.room, 'countStatus', {room: params.room, running: params.running})
        }
    }

    socket.on('keyPress', (params) => {
        console.log('key ', params.key, ' was pressed')
        if(params.key === 'i') {
            console.log(game.state['rooms'])
        }else if (params.key == 'p') {
            const roomId = Array.from(socket.rooms)[1]
            console.log(checkRoom(roomId)['e']['players'])
        }else if(params.key == 'f') {
            const room = getRoomId(socket.id)
            game.addFruit({room, callSocket: callSocket, fruitType: 'good'})
        }else if(params.key == 'b') {
            const room = getRoomId(socket.id)
            generateFruit = setInterval(() => game.addFruit({callSocket, room, fruitType: 'bad'}), 10000)
        }
    })


    socket.on('btnPressed', (params) => {
        const btnPressed = params.btn
        const room = getRoomId(socket.id)

        game.btnPressed({ socket: socket.id, room, btnPressed, callSocket: callSocket })
    })
 
    socket.on('createRoom', (params) => {
        game.createRoom({ socket, callSocket, })
    })

    socket.on('enterRoom', (params) => {
        const room = checkRoom(params.roomId)
        console.log(params)

        if(room != -1) {
            if(room.e.gameStatus != 'inGame') {
                game.enterPlayer({socketId: socket.id, room, callSocket})
                game.playerStatus({socketId: socket.id, room, callSocket, preset: true})
            }else if(room.e.gameStatus == 'inGame'){
                console.log('Mandar socket para pagina de espectador')
                socket.emit('redirectView', {room})
            }
        }else {
            socket.emit('leavePlayers', {room: params.room})
        }
    })

    socket.on('newViewer', (params) => {
        const room = checkRoom(params.roomId)
        if(room != -1) {
            socket.join(params.roomId)
            socket.emit('viewerConnected', {room})
            game.addViewer({viewerId: socket.id, roomId: room.e.id})
        }else {
            console.log('sala não existe, redirecionar espectador')
            socket.emit('leaveViewer', {room: params.room})
        }
    })

    socket.on('disconnect', () => {
        const room = getRoomId(socket.id)
        
        game.leavePlayer({socketId: socket.id, callSocket, room})
    })
})

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

app.get('/control', (req, res) => {
    res.sendFile(__dirname + '/public/html/game-control.html')
})

app.get('/view', (req, res) => {
    res.sendFile(__dirname + '/public/html/game-viewer.html')
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log('Server is running on PORT: ' + PORT)
})
