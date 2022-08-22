const qrCode = document.getElementById('qr-code')

const socket = io('https://higor-game.herokuapp.com/')

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
    console.log('heloo', params)
    const roomId = params.roomId

    qrCode.setAttribute('src', `https://chart.googleapis.com/chart?chs=510x510&cht=qr&chco=414141,c1c1c1&chf=bg,s,c1c1c1&chl=https://higor-game.netlify.app/html/game-control.html?roomId=${roomId}`)
    qrCode.setAttribute('title', 'Clique para conectar controle.')
    qrCode.style.cursor = 'pointer'

    qrCode.addEventListener('click', () => {
        window.open(`https://higor-game.netlify.app/html/game-control.html?roomId=${roomId}`, '_blank')
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
