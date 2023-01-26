const PORT = window.location.origin

const socketSrc = document.getElementById('socket-js')

socketSrc.setAttribute('src', `${PORT}/socket.io/socket.io.js`)

const qrCode = document.getElementById('qr-code')

const socket = io(`${PORT}/`)
var game = {players: [], fruits: []}

const label = document.getElementById('openQrCodeLabel')
label.addEventListener('click', () => {
    const checkButton = document.getElementById('openQrCode')
    if(checkButton.checked) {
        label.innerText = 'Fechar qr-code'
        label.title = 'Fechar qr-code'
    }else {
        label.innerText = 'Abrir qr-code'
        label.title = 'Abrir qr-code'
    }
})


socket.on('connect', () => {
    socket.emit('createRoom', {})
})

socket.on('createdRoom', (params) => {
    const roomId = params.roomId

    qrCode.setAttribute('src', `https://chart.googleapis.com/chart?chs=510x510&cht=qr&chco=414141,c1c1c1&chf=bg,s,c1c1c1&chl=${PORT}/control?roomId=${roomId}`)
    qrCode.setAttribute('title', 'Clique para conectar controle.')
    qrCode.style.cursor = 'pointer'

    qrCode.addEventListener('click', () => {
        window.open(`${PORT}/control?roomId=${roomId}`, '_blank')
    })
})

socket.on('playerEntered', (params) => {
    const checkButton = document.getElementById('openQrCode')
    checkButton.checked = true
    label.innerText = 'Abrir qr-code'
    label.title = 'Abrir qr-code'
})

socket.on('state', (params) => {
    game = params.state
    console.log(game)
})


document.addEventListener('keydown', (e) => {
    socket.emit('keyPress', {key: e.key})
})

const screen = document.getElementById('screen')

renderScreen(screen)

function renderScreen(screen) {
    const context = screen.getContext('2d')

    context.fillStyle = '#c1c1c1'
    context.fillRect(0, 0, 60, 60)

    game['players'].forEach((e, i) => {
        context.fillStyle = `rgba(${e.color},0.6)`
        context.fillRect(e.playerX, e.playerY, 1, 1)
    });

    game['fruits'].forEach((e, i) => {
        context.fillStyle = `${e.color}`
        context.fillRect(e.fruitX, e.fruitY, 1, 1)
    });

    requestAnimationFrame(() => renderScreen(screen))
}
