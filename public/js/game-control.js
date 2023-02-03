const PORT = window.location.origin

const socketSrc = document.getElementById('socket-js')

socketSrc.setAttribute('src', `${PORT}/socket.io/socket.io.js`)

const socket = io(`${PORT}/`)

socket.on('connect', () => {
    const roomId = window.location.search.replace('?roomId=', '')
    console.log(roomId)
    socket.emit('enterRoom', {roomId})
})

socket.on('roomNotFound', (params) => {
    console.log('Sala ', params.roomId, ' não encontrada')
    window.href = PORT
})


const btn = Array.from(document.getElementsByClassName('btn'))

socket.on('startGame', (params) => {
    console.log('iniciou')
    const readyGroup = document.getElementsByClassName('readyGroup')[0]
    readyGroup.remove()
})

socket.on('countStatus', (params) => {
    const countDiv = document.createElement('div')
    countDiv.setAttribute('class', 'counting')
    if(params.running == true) {
        document.getElementsByClassName('control')[0].appendChild(countDiv)
        countDiv.innerHTML = '3'
        countInterval = setInterval(() => updateCount() , 1000)
        var count = 2
        const updateCount = () => {
            console.log(count)
            countDiv.innerHTML = count
            count = count - 1
            if(count == -1) {
                try{
                    clearInterval(countInterval)
                    Array.from(document.getElementsByClassName('counting'))[0].remove()
                }catch{
                    console.log('erro ao parar o timer')
                }
            }
        }
    }
    if(params.running == false) {
        try{
            clearInterval(countInterval)
            Array.from(document.getElementsByClassName('counting'))[0].remove()
        }catch{
            console.log('erro ao parar o timer')
        }
    }
})

socket.on('playerStatus', (params) => {
    console.log('playerStatus', params)
    const perCentPoints = document.getElementById('perCentPoints')
    const levelStatus = document.getElementById('levelStatus')
    if(params.preset == true) {
        document.getElementsByClassName('control')[0].setAttribute('style', `border: 3rem solid rgb(${params.playerStatus.e.color});`)
    
        perCentPoints.style.background = `rbg(${params.playerStatus.e.color})`
        levelStatus.style.border = `rgb(${params.playerStatus.e.color}) solid 3px`
        Array.from(document.getElementsByClassName('default')).forEach((e, i) => {
            e.setAttribute('style', `border: 1rem solid rgb(${params.playerStatus.e.color});`)
        })
    }

    console.log('atualizar a barra de pontos')
    const writePoints = document.getElementById('writtenPoints')
    writePoints.innerText = `${params.playerStatus.e.levelPoints}/${params.playerStatus.e.points + 1}`
    perCentPoints.style.background = `rgb(${params.playerStatus.e.color})`
    perCentPoints.style.width = (params.playerStatus.e.levelPoints/(params.playerStatus.e.points + 1)) * 100 + '%'
})

const readyBtn = document.getElementById('ready')

readyBtn.addEventListener('click', () => {
    socket.emit('btnPressed', {btn: {id: readyBtn.id, checked: readyBtn.checked}})
})

btn.forEach((e, i) => {
    const walkEvents = ['mousedown', 'touchstart']
    const stopEvents = ['touchend', 'mouseup', 'mouseout']
    var lastEvent = 'stop'

    walkEvents.forEach((event) => {
        e.addEventListener(event, () => {
            if(lastEvent != 'walk') {
                lastEvent = 'walk'
                walkInterval = setInterval(() => socket.emit('btnPressed', {btn: {id: e.id}}), 100)
            }
        })
    })

    stopEvents.forEach((event) => {
        e.addEventListener(event, () => {
            if(lastEvent != 'stop') {
                lastEvent = 'stop'
                clearInterval(walkInterval)
            }
        })
    })
})

socket.on('leavePlayers', (params) => {
    document.location.href = `${PORT}/`
})
