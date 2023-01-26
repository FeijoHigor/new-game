function game(params) {
    
    const state = {
        rooms: []
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

    const checkRoom = (id) => {
        var index = -1
        state['rooms'].forEach((e, i) => {
            if(e.id == id) {
                index = {e, i}
            }
        })

        return index
    }

    function checkStart(playerArray) {
        var playersReady = 0
        playerArray.forEach((e, i) => {
            if(e.playerStatus == 'ready') {
                playersReady++
            }
        });
        if(playersReady == playerArray.length) {
            return true
        }else{
            return false
        }
    }

    function btnPressed(params) {
        const {room, btnPressed} = params
        const roomState = state['rooms'][room.iRoom]
        const callSocket = params.callSocket

        if(btnPressed.id == 'left') {
            if(roomState['players'][room.iPlayer].playerX != 0) {
                state['rooms'][room.iRoom]['players'][room.iPlayer].playerX--                
            }
        }else if(btnPressed.id == 'up') {
            if(roomState['players'][room.iPlayer].playerY != 0) {
                state['rooms'][room.iRoom]['players'][room.iPlayer].playerY--
            } 
        }else if(btnPressed.id == 'right') {
            if(roomState['players'][room.iPlayer].playerX != 18) {
                state['rooms'][room.iRoom]['players'][room.iPlayer].playerX++
            }
        }else if(btnPressed.id == 'down') {
            if(roomState['players'][room.iPlayer].playerY != 18) {
                state['rooms'][room.iRoom]['players'][room.iPlayer].playerY++
            }
        }else if(btnPressed.id == 'ready') {
            if(btnPressed.checked == true) {
                state['rooms'][room.iRoom]['players'][room.iPlayer].playerStatus = 'ready'
                const canStart = checkStart(state['rooms'][room.iRoom]['players'])
                if(canStart) {
                    console.log('iniciando contagem')
                    startTimer = setTimeout(() => {
                        state['rooms'][room.iRoom]['players'].forEach((e, i) => {
                            e.playerStatus = 'inGame'
                        })
                        console.log('iniciou jogo')
                        callSocket('startGame', { room })
                    }, 3000)
                }
            }else if(btnPressed.checked == false) {
                const stopTimer = () => {
                    clearTimeout(startTimer)
                    console.log('stoped the timer')
                }
                stopTimer()
                state['rooms'][room.iRoom]['players'][room.iPlayer].playerStatus = 'waiting'
            }
        }

        checkFruitCollision({playerId: state['rooms'][room.iRoom]['players'][room.iPlayer].id, room, callSocket})
        callSocket('updateState', {state: state['rooms'][room.iRoom], room: room.room})
    }

    function enterPlayer(params) {
        const callSocket = params.callSocket
        const socketId = params.socketId
        const room = params.room
        console.log('player room display', room)
        
        if(room != -1) {
            const color = () => [parseInt(Math.random() * 255), parseInt(Math.random() * 255), parseInt(Math.random() * 255)].toString()

            const newColor = color()
            const playerPosition = () => {
                return parseInt(Math.random() * 18)
            }

            const newPlayer = {
                id: socketId,
                playerStatus: 'waiting',
                playerX: playerPosition(),
                playerY: playerPosition(),
                points: 1,
                color: newColor
            }

            state['rooms'][room.i]['players'].push(newPlayer)

            callSocket('joinRoom', {roomId: room.e.id, socketType: 'player'})
            callSocket('updateState', {state: state['rooms'][room.i], room: room.e.id})
            console.log(`Jogador conectado`)
        }else {
            console.log('Sala não encontrada: ', room)
        }
    }

    function addFruit(params) {
        const {callSocket, room} = params

        const fruitPosition = () => {
            return parseInt(Math.random() * 18)
        }

        const fruitId = () => {
            return parseInt(Math.random() * 99999999)
        }

        const newFruit = {
            id: fruitId(),
            color: '#ebd444',
            fruitX: fruitPosition(),
            fruitY: fruitPosition() 
        }

        state['rooms'][room.iRoom]['fruits'].push(newFruit)
        
        callSocket('fruitStatus', {state: state['rooms'][room.iRoom], room: room.room})
    }

    function removeFruit(params) {
        const {room, callSocket, fruit} = params

        state['rooms'][room.iRoom]['fruits'].splice(fruit.i, 1)

        callSocket('fruitStatus', {state: state['rooms'][room.iRoom], room: room.room})
    }

    function checkFruitCollision(params) {
        const {playerId, room, callSocket} = params

        const player = checkPlayer(playerId, state['rooms'][room.iRoom]['players'])

        state['rooms'][room.iRoom]['fruits'].forEach((e, i) => {
            if(player.e.playerX == e.fruitX && player.e.playerY == e.fruitY) {
                console.log('fruit collision')
                state['rooms'][room.iRoom]['players'][player.i].points++
                addFruit({callSocket, room})
                removeFruit({fruit: {e, i}, room, callSocket})
            }
        })
    }

    function leavePlayer(params) {
        
        const { room, socketId, callSocket } = params

        if(room == -1) {
            console.log('Socket não é nem jogador nem tela')
        }else if(room.type == 'control') {
            console.log(`O jogador ${socketId} saiu da sala ${room.room}.`)
            state['rooms'][room.iRoom]['players'].splice(room.iPlayer, 1)
            callSocket('updateState', {state: state['rooms'][room.iRoom], room: room.room})
        }else if(room.type == 'screen') {
            console.log(`A sala ${room.room} foi desconctada.`)
            state['rooms'].splice(room.iRoom, 1)
            callSocket('leaveScreen', {room: room.room})
        }
    }

    function createRoom(params) {
        const socket = params.socket
        const callSocket = params.callSocket

        const createRoomId = () => Math.floor(Math.random() * 9999999999)

        const roomId = createRoomId()
        const roomExists = checkRoom(roomId)

        if(roomExists != -1) {
            createRoom(params)
        }else {
            const room = {id: roomId, gameScreen: socket.id, players: [], fruits: []}
            state['rooms'].push(room)

            callSocket('joinRoom', {roomId: roomId, socketType: 'room'})
            callSocket('createRoom', {roomId})
        }
    }

    function playerStatus(params) {
        const socketId = params.socketId
        const room = params.room
        const callSocket = params.callSocket

        if(room != -1) {
            const playerStatus = checkPlayer(socketId, state['rooms'][room.i]['players'])
            callSocket('playerStatus', {playerStatus, roomId: room.e.id })
        }

    }



    return {
        state,
        btnPressed,
        enterPlayer,
        leavePlayer,
        createRoom,
        playerStatus,
        addFruit,
    }

}

module.exports = { game }