const socket = io('http://localhost:3003')

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
        e.setAttribute('style', `background-color: rgb(${params.playerStatus.e.color});`)
    })
})

btn.forEach((e, i) => {
    e.addEventListener('click', () => {
        console.log(e)
        socket.emit('btnPressed', {btn: {id: e.id, checked: e.checked}})
    })
})

socket.on('leavePlayers', (params) => {
    document.location.href = 'http://localhost:5501/client/html/game-screen.html'
})

document.addEventListener('keydown', (e) => {
    socket.emit('keyPress', {key: e.key})
})
