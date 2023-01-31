const PORT = window.location.origin

const socketSrc = document.getElementById('socket-js')

socketSrc.setAttribute('src', `${PORT}/socket.io/socket.io.js`)

const socket = io(`${PORT}/`)

socket.on('connect', () => {
    console.log(socket.id)
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
    const readyBtn = document.getElementsByClassName('ready')[0]
    readyBtn.remove()
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
                clearInterval(countInterval)
                Array.from(document.getElementsByClassName('counting'))[0].remove()
            }
        }
    }
    if(params.running == false) {
        clearInterval(countInterval)
        Array.from(document.getElementsByClassName('counting'))[0].remove()
    }
})

socket.on('playerStatus', (params) => {
    console.log(document.getElementsByTagName('body'))
    document.getElementsByClassName('control')[0].setAttribute('style', `border: 3rem solid rgb(${params.playerStatus.e.color});`)

    Array.from(document.getElementsByClassName('default')).forEach((e, i) => {
        e.setAttribute('style', `border: 1rem solid rgb(${params.playerStatus.e.color});`)
    })
})

btn.forEach((e, i) => {
    const walkEvents = ['mousedown', 'touchstart']
    const stopEvents = ['touchend', 'mouseup', 'mouseout']
    var lastEvent = 'stop'

    walkEvents.forEach((event) => {
        e.addEventListener(event, () => {
            if(lastEvent != 'walk') {
                lastEvent = 'walk'
                walkInterval = setInterval(() => socket.emit('btnPressed', {btn: {id: e.id, checked: e.checked}}), 100)
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
