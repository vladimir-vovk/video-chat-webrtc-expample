const socket = io('/')
const peer = new Peer(undefined, {
  // host: '/',
  // port: '3001'
})

const calls = {}

peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})


const videoGridEl = document.querySelector('#video-grid')
const urlEl = document.querySelector('#url')
urlEl.innerText = `${window.location.origin}/${ROOM_ID}`

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  const videoEl = document.createElement('video')
  videoEl.muted = true
  addVideoStream(videoEl, stream)

  peer.on('call', call => {
    call.answer(stream)

    const videoEl = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(videoEl, userVideoStream)
    })
  })

  socket.on('user-connected', userId => {
    connectToUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (calls[userId]) {
    calls[userId].close()
  }
})

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })

  videoGridEl.append(video)
}

function connectToUser(userId, stream) {
  const call = peer.call(userId, stream)
  const videoEl = document.createElement('video')

  call.on('stream', userVideoStream => {
    addVideoStream(videoEl, userVideoStream)
  })

  call.on('close', () => {
    videoEl.remove()
  })

  calls[userId] = call
}
