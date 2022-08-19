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
            console.log(params.room)
            socket.to(params.room).emit('state', {state: params.state})
        }else if(socketType == 'startGame') {
            console.log(params.room, ' started the game')
            socket.to(params.room).emit('startGame', {room: params.room})
        }else if(socketType == 'joinRoom') {
            socket.join(params.roomId)
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
        console.log(params.btn)
        const btnPressed = params.btn
        const room = getRoomId(socket.id)

        game.btnPressed({ socket: socket.id, room, btnPressed, callSoocket: callSoocket })
    })

    socket.on('createRoom', (params) => {
        const roomId = params.roomId
        const roomExists = checkRoom(roomId)

        if(roomExists != -1) {
            socket.emit('roomExists', {roomId})
        }else {
            const room = {id: roomId, gameScreen: socket.id, players: []}
            game.state['rooms'].push(room)

            socket.join(roomId)
            socket.emit('createdRoom', {roomId})

            console.log('Nova sala foi criada: ', roomId)
            console.log('Esperando jogadores')
        }
    })

    socket.on('enterRoom', (params) => {

        const room = checkRoom(params.roomId)
        game.enterPlayer({socketId: socket.id, room, callSoocket})

        /*const roomId = params.roomId

        const room = checkRoom(roomId)

        if(room != -1) {

            const color = () => [parseInt(Math.random() * 255), parseInt(Math.random() * 255), parseInt(Math.random() * 255)].toString()

            const newColor = color()
            console.log(roomId)
            //player status: 'waiting', 'ready', 'inGame'
            game.state['rooms'][room.i]['players'].push({id: socket.id, playerStatus: 'waiting', playerX: 5, playerY: 5, color: newColor})
            socket.join(roomId)
            socket.to(roomId).emit('hello', {state: game.state['rooms'][room.i]})
            console.log(`Jogador ${socket.id} foi conectado. Pronto para jogar?`)
        }else {
            socket.emit('roomNotFound', {roomId})
            console.log('Sala não encontrada: ', roomId)
        }*/
    })

    socket.on('disconnect', () => {

        const room = getRoomId(socket.id)

        if(room == -1) {
            console.log('Socket não é nem jogador nem tela')
        }else if(room.type == 'control') {
            console.log(`O jogador ${socket.id} saiu da sala ${room.id}.`)
            game.state['rooms'][room.iRoom]['players'].splice(room.iPlayer, 1)
        }else if(room.type == 'screen') {
            console.log(`A sala ${room.room} foi desconctada.`)
            game.state['rooms'].splice(room.iRoom, 1)
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

module.exports = {}