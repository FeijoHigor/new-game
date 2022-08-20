function game(params) {
    
    const state = {
        rooms: []
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
        const {socketId, room, btnPressed} = params
        const roomState = state['rooms'][room.iRoom]
        const callSoocket = params.callSoocket

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
                        callSoocket('startGame', { room })
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

        callSoocket('updateState', {state: state['rooms'][room.iRoom], room: room.room})
    }

    function enterPlayer(params) {
        const callSoocket = params.callSoocket
        const socketId = params.socketId
        const room = params.room
        console.log(room)
        
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
                color: newColor
            }

            state['rooms'][room.i]['players'].push(newPlayer)

            callSoocket('joinRoom', {roomId: room.e.id})
            callSoocket('updateState', {state: state['rooms'][room.i], room: room.e.id})
            console.log(`Jogador conectado`)
        }else {
            console.log('Sala não encontrada: ', room)
        }
    }

    function leavePlayer(params) {
        
    }

    return {
        state,
        btnPressed,
        enterPlayer,
        leavePlayer
    }

}

module.exports = { game }