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

    const checkRoom = (id) => {
        var index = -1
        game['rooms'].forEach((e, i) => {
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

        game['rooms'].forEach((e, i) => {
            if(e.gameScreen == socketId) {
                room = {room: e.id, iRoom: i, type: 'screen'}
            }
        })

        if(room == -1) {
            game['rooms'].forEach((eRoom, iRoom) => {
                eRoom.players.forEach((ePlayer, iPlayer) => {
                    if(ePlayer.id == socketId) {
                        room = {room: eRoom.id, iRoom: iRoom, iPlayer: iPlayer, type: 'control'}
                    }
                })
            })
        }

        return room
    }

    socket.on('keyPress', (params) => {
        console.log('key ', params.key, ' was pressed')
        if(params.key === 'i') {
            console.log(game['rooms'])
        }else if (params.key == 'p') {
            const roomId = Array.from(socket.rooms)[1]
            console.log(checkRoom(roomId)['e']['players'])
        }
    })


    socket.on('btnPressed', (params) => {
        const btnPressed = params.btn

        console.log(btnPressed)
    })

    socket.on('createRoom', (params) => {
        const newRoom = params.roomId
        const roomExists = checkRoom(newRoom)
        console.log('roooooom', params)

        if(roomExists != -1) {
            socket.emit('roomExists', {roomId: newRoom})
            return
        }else {
            const room = {id: newRoom, gameScreen: socket.id, players: []}
            game['rooms'].push(room)

            socket.join(newRoom)
            socket.emit('createdRoom', {roomId: newRoom})

            console.log('New room was created: ', newRoom)
            console.log('Waiting control enter')
        }
    })

    socket.on('enterRoom', (params) => {
        const roomId = params.roomId

        const room = checkRoom(roomId)

        if(room != -1) {
            game['rooms'][room.i]['players'].push({id: socket.id})
            socket.join(roomId)
            console.log(`Player ${socket.id} connected. Ready to play?`)
        }else {
            socket.emit('roomNotFound', {roomId})
            console.log('Room not found ', roomId)
        }
    })

    socket.on('disconnect', () => {

        const room = getRoomId(socket.id)
        console.log(room)

        if(room == -1) {
            console.log('?????')
        }else if(room.type == 'control') {
            console.log(`O player ${socket.id} saiu da sala ${room.id}.`)
            game['rooms'][room.iRoom]['players'].splice(room.iPlayer, 1)
        }else if(room.type == 'screen') {
            console.log(`A sala ${room.room} foi desconctada.`)
            game['rooms'].splice(room.iRoom, 1)
        }

        /*const room = checkRoom(roomId)

        const removePlayer = room != -1 ? checkPlayer(socket.id, room['e']['players']) : -1

        console.log(room)

        if(room == -1) {
            console.log('Sala não encontrada', room)
            socket.emit('roomNotFound', {roomId: ''})
        }else if(room['e'].gameScreen == socket.id) {
            console.log(`A sala ${roomId} foi desconctada.`)
            game['rooms'].splice(room['i'], 1)
            socket.to(roomId).emit('disconnectedRoom', {room: room['e']})
        }else if (removePlayer != -1) {
            console.log(`O player ${socket.id} saiu da sala ${roomId}.`)
            room['e']['players'].splice(removePlayer['i'], 1)
        }*/

    })
})

app.get('/', (req, res) => {
    res.send('hello')
})

const PORT = 3003

server.listen(PORT, () => {
    console.log('Server is running')
})