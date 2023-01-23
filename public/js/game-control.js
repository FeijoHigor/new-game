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
})

const btn = Array.from(document.getElementsByClassName('btn'))

socket.on('playerStatus', (params) => {
    console.log(document.getElementsByTagName('body'))
    document.getElementsByClassName('control')[0].setAttribute('style', `border: 3rem solid rgb(${params.playerStatus.e.color});`)

    Array.from(document.getElementsByClassName('default')).forEach((e, i) => {
        e.setAttribute('style', `border: 1rem solid rgb(${params.playerStatus.e.color});`)
    })
})

btn.forEach((e, i) => {
    e.addEventListener('mousedown', () => {
        walk = setInterval(() => socket.emit('btnPressed', {btn: {id: e.id, checked: e.checked}}), 100)
    })
    e.addEventListener('mouseup', () => {
        if(walk) {
          clearInterval(walk)  
        }
    })
    e.addEventListener('mouseout', () => {
        if(walk) {
            clearInterval(walk)  
          }
    })
})

socket.on('leavePlayers', (params) => {
    document.location.href = `${PORT}/`
})

document.addEventListener('keydown', (e) => {
    socket.emit('keyPress', {key: e.key})
})
