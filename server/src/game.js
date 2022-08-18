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
        const callSoocket = params.callSoocket

        if(btnPressed.id == 'left') {
            state['rooms'][room.iRoom]['players'][room.iPlayer].playerX--
        }else if(btnPressed.id == 'up') {
            state['rooms'][room.iRoom]['players'][room.iPlayer].playerY--
        }else if(btnPressed.id == 'right') {
            state['rooms'][room.iRoom]['players'][room.iPlayer].playerX++
        }else if(btnPressed.id == 'down') {
            state['rooms'][room.iRoom]['players'][room.iPlayer].playerY++
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

        callSoocket('updateState', {state: state['rooms'][room.iRoom], room})
    }

    return {
        state,
        btnPressed,
    }

}

module.exports = { game }