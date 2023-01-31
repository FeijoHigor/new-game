function game(params) {
    
    const state = {
        rooms: [],
        mapSize: 40
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
            if(roomState['players'][room.iPlayer].playerX != state['mapSize'] - roomState['players'][room.iPlayer].points - 1) {
                state['rooms'][room.iRoom]['players'][room.iPlayer].playerX++
            }
        }else if(btnPressed.id == 'down') {
            if(roomState['players'][room.iPlayer].playerY != state['mapSize'] - roomState['players'][room.iPlayer].points - 1) {
                state['rooms'][room.iRoom]['players'][room.iPlayer].playerY++
            }
        }else if(btnPressed.id == 'ready') {
            if(btnPressed.checked == false && state['rooms'][room.iRoom].gameStatus != 'inGame') {
                state['rooms'][room.iRoom]['players'][room.iPlayer].playerStatus = 'ready'
                const canStart = checkStart(state['rooms'][room.iRoom]['players'])
                if(canStart) {
                    callSocket('countStatus', { room, running: true })
                    startTimer = setTimeout(() => {
                        state['rooms'][room.iRoom].gameStatus = 'inGame'
                        console.log('iniciou jogo')
                        callSocket('startGame', { room })
                    }, 3000)
                }
            }else if(btnPressed.checked == true) {
                if(state['rooms'][room.iRoom].gameStatus != 'inGame') {
                    callSocket('countStatus', { room, running: false })
                    const stopTimer = () => {
                        clearTimeout(startTimer)
                        console.log('parou o contador')
                    }
                    stopTimer()
                    state['rooms'][room.iRoom].gameStatus = 'waiting'
                }else {
                    console.log('já está no jogo')
                }
            }
        }

        checkFruitCollision({playerId: state['rooms'][room.iRoom]['players'][room.iPlayer].id, room, callSocket})
        checkPlayerCollision({playerId: state['rooms'][room.iRoom]['players'][room.iPlayer].id, room, callSocket})
        callSocket('updateState', {state: state['rooms'][room.iRoom], room: room.room})
    }

    function enterPlayer(params) {
        const callSocket = params.callSocket
        const socketId = params.socketId
        const room = params.room
        
        
        if(room != -1) {
            if(room.e.gameStatus == 'inGame') {
                console.log('Jogo já está rodando')
            }else {
                const color = () => [parseInt(Math.random() * 255), parseInt(Math.random() * 255), parseInt(Math.random() * 255)].toString()

                const newColor = color()
                const playerPosition = () => {
                    return parseInt(Math.random() * state['mapSize'])
                }

                const newPlayer = {
                    id: socketId,
                    playerStatus: 'waiting',
                    playerX: playerPosition(),
                    playerY: playerPosition(),
                    points: 0,
                    color: newColor
                }

                const checking = checkSpawnLocal({room, player: newPlayer})
                if(checking.isInside === true) {
                    enterPlayer(params)
                    console.log('opa')
                    console.log(checking)
                }else {
                    state['rooms'][room.i]['players'].push(newPlayer)
        
                    callSocket('joinRoom', {roomId: room.e.id, socketType: 'player'})
                    callSocket('updateState', {state: state['rooms'][room.i], room: room.e.id})
                    console.log(`Jogador conectado`)
                }
            }
        }else {
            console.log('Sala não encontrada: ', room)
        }
    }

    function addFruit(params) {
        const {callSocket, room, fruitType} = params

        if(checkRoom(room.room) != -1) {
            const fruitPosition = () => {
                return parseInt(Math.random() * state['mapSize'])
            }

            const fruitId = () => {
                return parseInt(Math.random() * 99999999)
            }

            const newFruit = {
                id: fruitId(),
                color: fruitType == 'good' ? '235, 212, 68' : '171, 36, 255',
                fruitX: fruitPosition(),
                fruitY: fruitPosition(),
                fruitType
            }

            const roomPlayers = checkRoom(room.room).e.players

            const checkCollision = () => {
                var isFruitInside = 0
                roomPlayers.forEach((e, i) => {
                    if(newFruit.fruitX >= e.playerX && newFruit.fruitX <= e.playerX + e.points 
                        && newFruit.fruitY >= e.playerY && newFruit.fruitY <= e.playerY + e.points) {
                            isFruitInside++
                    }
                })

                if(isFruitInside > 0) {
                    addFruit({callSocket, room, fruitType})
                }else {
                    state['rooms'][room.iRoom]['fruits'].push(newFruit)
                    callSocket('fruitStatus', {state: state['rooms'][room.iRoom], room: room.room})
                }
            }

            checkCollision()
        }else {
            console.log('Sala não encontrada: ', checkRoom(room.room))
            clearInterval(generateFruit)
        }
    }

    function removeFruit(params) {
        const {room, callSocket, fruit} = params

        state['rooms'][room.iRoom]['fruits'].splice(fruit.i, 1)

        callSocket('fruitStatus', {state: state['rooms'][room.iRoom], room: room.room})
    }

    function checkSpawnLocal(params) {
        const {room, player} = params

        const roomPlayers = room.e.players

        var isPlayerInside = 0
        if(roomPlayers.length > 0) {
            roomPlayers.forEach((e, i) => {
                if(player.id != e.id) {
                    if(player.playerX >= e.playerX && player.playerX <= e.playerX + e.points 
                        && player.playerY >= e.playerY && player.playerY <= e.playerY + e.points) {
                            isPlayerInside++
                    }
                }
            })
        }

        if(isPlayerInside > 0) {
            console.log('player dentro')
            return {isInside: true}
        }else {
            return {isInside: false}
        }
    }

    function checkFruitCollision(params) {
        const {playerId, room, callSocket} = params

        const player = checkPlayer(playerId, state['rooms'][room.iRoom]['players'])

        state['rooms'][room.iRoom]['fruits'].forEach((e, i) => {
            if(e.fruitX >= player.e.playerX && e.fruitX <= player.e.playerX + player.e.points 
                && e.fruitY >= player.e.playerY && e.fruitY <= player.e.playerY + player.e.points ) {
                if(e.fruitType == 'good') {
                    removeFruit({fruit: {e, i}, room, callSocket})
                    addFruit({callSocket, room, fruitType: 'good'})
                    player.e.points < 14 ? state['rooms'][room.iRoom]['players'][player.i].points++ : false
                    checkPlayerPosition({playerId, room})
                    checkFruitCollision(params)
                }else if(player.e.points > 0 && e.fruitType == 'bad') {
                    removeFruit({fruit: {e, i}, room, callSocket})
                    state['rooms'][room.iRoom]['players'][player.i].points = Math.floor(player.e.points - player.e.points / 2)
                }
            }
        })
    }

    function checkPlayerCollision(params) {
        const {playerId, room, callSocket} = params

        const player = checkPlayer(playerId, state['rooms'][room.iRoom]['players'])

        const respawnPlayer = (params) => {
            const { player, room } = params
            const playerPosition = () => {
                return parseInt(Math.random() * state['mapSize'])
            }
            player.e.points = 0
            player.e.playerX = playerPosition()
            player.e.playerY = playerPosition()
            const checkingPosition = checkSpawnLocal({room: checkRoom(room.room), player: player.e})

            if(checkingPosition.isInside === true) {
                console.log('renasceu dentro')
                respawnPlayer(params)
            }else (
                console.log('renasceu fora'),
                state['rooms'][room.iRoom]['players'][player.i] = player.e
            )
            
        }

        state['rooms'][room.iRoom]['players'].forEach((e, i) => {
            if(e.id != playerId) {
                if(player.e.points != e.points) {
                    if(player.e.playerX + player.e.points >= e.playerX + e.points && player.e.playerX <= e.playerX + e.points && player.e.playerX <= e.playerX
                        && player.e.playerY + player.e.points >= e.playerY + e.points && player.e.playerY <= e.playerY + e.points && player.e.playerY <= e.playerY) {
                        console.log('ganhou')
                        player.e.points <= 12 ? state['rooms'][room.iRoom]['players'][player.i].points = player.e.points + 2 :
                        checkPlayerPosition({room, playerId: player.e.id})
                        respawnPlayer({room, player: {e, i}})
                        checkFruitCollision({room, playerId: player.e.id, callSocket})
                    }else if(e.playerX + e.points >= player.e.playerX + player.e.points && e.playerX <= player.e.playerX + player.e.points && e.playerX <= player.e.playerX 
                        && e.playerY + e.points >= player.e.playerY + player.e.points && e.playerY <= player.e.playerY + player.e.points && e.playerY <= player.e.playerY) {
                            console.log('perdeu')
                            e.points <= 12 ? state['rooms'][room.iRoom]['players'][i].points = e.points + 2 :
                            checkPlayerPosition({room, playerId: e.id})
                            respawnPlayer({room, player})
                            checkFruitCollision({room, playerId: e.id, callSocket})
                        }
                }
            }
        })
    }

    function checkPlayerPosition(params) {
        const {room, playerId} = params

        const roomPlayers = checkRoom(room.room).e.players
        const player = checkPlayer(playerId, roomPlayers)

        const xPosition = state['mapSize'] - (player.e.playerX + player.e.points)
        const yPosition = state['mapSize'] - (player.e.playerY + player.e.points)
        if(xPosition < 1) {
            state['rooms'][room.iRoom]['players'][player.i].playerX = player.e.playerX + (xPosition - 1)
        }
        if(yPosition < 1) {
            state['rooms'][room.iRoom]['players'][player.i].playerY = player.e.playerY + (yPosition - 1)
        }
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
            const room = {id: roomId, gameScreen: socket.id, players: [], fruits: [], gameStatus: 'waiting'}
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