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

const btn = document.getElementsByClassName('btn')

btn[1].addEventListener('click', () => {
    console.log('right')
    socket.emit('btnPressed', {btn: 'right'})
})

btn[0].addEventListener('click', () => {
    console.log('left')
    socket.emit('btnPressed', {btn: 'left'})
})

