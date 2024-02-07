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
    console.log('adicionar mais um espectador')
    const roomId = window.location.search.replace('?roomId=', '')
    socket.emit('newViewer', {roomId})
})

socket.on('viewerConnected', (params) => {
    var roomId = params.room.e.id
    game = params.room.e

    qrCode.setAttribute('src', `https://chart.googleapis.com/chart?chs=510x510&cht=qr&chco=414141,c1c1c1&chf=bg,s,c1c1c1&chl=${PORT}/view?roomId=${roomId}`)
    qrCode.setAttribute('title', 'Clique para abrir nova pagina de espectador.')
    qrCode.style.cursor = 'pointer'

    roomIdLink = params.room.e.id
    qrCode.addEventListener('click', () => {
        window.open(`${PORT}/view?roomId=${roomIdLink}`, '_blank')
    })
})

socket.on('countStatus', (params) => {
    const countDiv = document.createElement('div')
    countDiv.setAttribute('class', 'counting')
    if(params.running == true) {
        document.getElementsByTagName('body')[0].appendChild(countDiv)
        countDiv.innerHTML = '3'
        countInterval = setInterval(() => updateCount() , 1000)
        var count = 2
        const updateCount = () => {
            countDiv.innerHTML = count
            count = count - 1
            if(count == -1) {
                try{
                    clearInterval(countInterval)
                    Array.from(document.getElementsByClassName('counting'))[0].remove()
                }catch{
                    console.log('erro ao parar o timer')
                }
            }
        }
    }
    if(params.running == false) {
        try{
            clearInterval(countInterval)
            Array.from(document.getElementsByClassName('counting'))[0].remove()
        }catch{
            console.log('erro ao parar o timer')
        }
    }
})

socket.on('state', (params) => {
    console.log("opa")
    game = params.state
})


document.addEventListener('keydown', (e) => {
    socket.emit('keyPress', {key: e.key})
})

const screen = document.getElementById('screen')

renderScreen(screen)

function renderScreen(screen) {
    const context = screen.getContext('2d')

    context.fillStyle = '#c1c1c1'
    context.fillRect(0, 0, 40, 40)

    game['players'].forEach((e, i) => {
        context.fillStyle = `rgba(${e.color},0.6)`
        context.fillRect(e.playerX, e.playerY, e.points + 1, e.points + 1)
    });

    game['fruits'].forEach((e, i) => {
        context.fillStyle = `rgba(${e.color}, 0.7)`
        context.fillRect(e.fruitX, e.fruitY, 1, 1)
    });

    requestAnimationFrame(() => renderScreen(screen))
}

socket.on('leaveViewer', (params) => {
    document.location.href = `${PORT}/`
})
