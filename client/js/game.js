const socket = io('http://localhost:3003')

socket.on('connect', () => {
    console.log(socket.id)
})

document.addEventListener('keydown', (e) => {
    socket.emit('keyPress', {key: e.key})
})