const net = require('net')

// net.createServer(socket => {
//   socket.on('data', function (data) {
//     console.log('Echoing: %s', data.toString())
//     socket.write(data.toString())
//   })
// }).listen(8000)

const server = net.createServer()

server.on('connection', function (socket) {
  const address = socket.remoteAddress + ':' + socket.remotePort
  console.log('server is connected' + address)

  socket.on('data', function (data) {
    console.log(data)
    socket.write(data + ':from server')
  })
  socket.once('close', function () {
    console.log('closing the connection on ' + address)
  })
  socket.on('error', function (error) {
    console.log('Error on ' + address)
    console.log(error.message)
    socket.write(error.message)
  })
})
server.listen(8000, function () {
  console.log('server is listening' + JSON.stringify(server.address()))
})
