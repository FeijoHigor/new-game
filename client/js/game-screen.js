const enterGameBtn = document.getElementsByClassName('enter-game')[0]

const socket = io('http://localhost:3003')

const createRoom = () => Math.floor(Math.random() * 9999999999)

var game = {players: []}

socket.on('connect', () => {
    console.log('hello ',socket.id)
    socket.emit('createRoom', {roomId: createRoom()})
})

socket.on('roomExists', (params) => {
    socket.emit('createRoom', {roomId: createRoom()})
})

socket.on('createdRoom', (params) => {
    const roomId = params.roomId

    console.log(roomId)
    enterGameBtn.style.display = 'block'
    enterGameBtn.href = `http://localhost:5500/client/html/game-control.html?roomId=${roomId}`
})

socket.on('state', (params) => {
    console.log('foi', params.state)
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