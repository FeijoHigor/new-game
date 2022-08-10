const enterGameBtn = document.getElementsByClassName('enter-game')[0]

const socket = io('http://localhost:3003')

const createRoom = () => Math.floor(Math.random() * 9999999999)

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

document.addEventListener('keydown', (e) => {
    socket.emit('keyPress', {key: e.key})
})