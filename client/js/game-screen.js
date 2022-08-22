const qrCode = document.getElementById('qr-code')

const socket = io('http://localhost:3003')

const createRoom = () => Math.floor(Math.random() * 9999999999)

var game = {players: []}

socket.on('connect', () => {
    socket.emit('createRoom', {roomId: createRoom()})
})

socket.on('roomExists', (params) => {
    socket.emit('createRoom', {roomId: createRoom()})
})

socket.on('createdRoom', (params) => {
    const roomId = params.roomId

    qrCode.setAttribute('src', `https://chart.googleapis.com/chart?chs=510x510&cht=qr&chco=414141,c1c1c1&chf=bg,s,c1c1c1&chl=http://localhost:5500/html/game-control.html?roomId=${roomId}`)
    qrCode.setAttribute('title', 'Clique para conectar controle.')
    qrCode.style.cursor = 'pointer'

    qrCode.addEventListener('click', () => {
        window.open(`http://localhost:5500/client/html/game-control.html?roomId=${roomId}`, '_blank')
    })
})

socket.on('playerEntered', (params) => {
    qrCode.style.display = 'none'
})

socket.on('state', (params) => {
    game = params.state
})

const screen = document.getElementById('screen')
const context = screen.getContext('2d')

renderScreen()

function renderScreen() {
    context.fillStyle = '#D9D9D9'
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

function showQr() {
    const label = document.getElementById('openQrCodeLabel')
    label.addEventListener('click', () => {
        
    })
}