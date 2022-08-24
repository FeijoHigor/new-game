const pageHost = window.location.hostname == '127.0.0.1' || window.location.hostname == 'localhost' ? 'development' : 'production'

const SERVER_PORT = pageHost == 'development' ? 'http://localhost:3003' : 'https://higor-game.herokuapp.com'
const CLIENT_PORT = pageHost == 'development' ? `${window.location.origin}/client` : window.location.origin
const socketSrc = document.getElementById('socket-js')

socketSrc.setAttribute('src', `${SERVER_PORT}/socket.io/socket.io.js`)

const qrCode = document.getElementById('qr-code')

const socket = io(`${SERVER_PORT}/`)
var game = {players: []}

const label = document.getElementById('openQrCodeLabel')
label.addEventListener('click', () => {
    const checkButton = document.getElementById('openQrCode')
    console.log(checkButton.checked)
    if(checkButton.checked) {
        label.innerText = 'Fechar qr-code'
        label.title = 'Fechar qr-code'
    }else {
        label.innerText = 'Abir qr-code'
        label.title = 'Abrir qr-code'
        
    }
})


socket.on('connect', () => {
    socket.emit('createRoom', {})
})

socket.on('createdRoom', (params) => {
    const roomId = params.roomId

    qrCode.setAttribute('src', `https://chart.googleapis.com/chart?chs=510x510&cht=qr&chco=414141,c1c1c1&chf=bg,s,c1c1c1&chl=${CLIENT_PORT}/html/game-control.html?roomId=${roomId}`)
    qrCode.setAttribute('title', 'Clique para conectar controle.')
    qrCode.style.cursor = 'pointer'

    qrCode.addEventListener('click', () => {
        window.open(`${CLIENT_PORT}/html/game-control.html?roomId=${roomId}`, '_blank')
    })
})

socket.on('playerEntered', (params) => {
    const checkButton = document.getElementById('openQrCode')
    checkButton.checked = true
    label.innerText = 'Abir qr-code'
    label.title = 'Abrir qr-code'
})

socket.on('state', (params) => {
    game = params.state
})

const screen = document.getElementById('screen')
const context = screen.getContext('2d')

renderScreen()

function renderScreen() {
    context.fillStyle = '#c1c1c1'
    context.fillRect(0, 0, 20, 20)
    game['players'].forEach((e, i) => {
        context.fillStyle = `rgba(${e.color},0.6)`
        context.fillRect(e.playerX, e.playerY, 2, 2)
    });
    
    requestAnimationFrame(renderScreen)
}


document.addEventListener('keydown', (e) => {
    socket.emit('keyPress', {key: e.key})
})
