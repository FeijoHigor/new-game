const pageHost = window.location.hostname == '127.0.0.1' || window.location.hostname == 'localhost' ? 'development' : 'production'

const SERVER_PORT = pageHost == 'development' ? 'http://localhost:3003' : 'https://higor-game.herokuapp.com'
const CLIENT_PORT = window.location.origin
const socketSrc = document.getElementById('socket-js')

socketSrc.setAttribute('src', `${SERVER_PORT}/socket.io/socket.io.js`)

const socket = io(`${SERVER_PORT}/`)

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
    document.location.href = `${CLIENT_PORT}/client/`
})

document.addEventListener('keydown', (e) => {
    socket.emit('keyPress', {key: e.key})
})
