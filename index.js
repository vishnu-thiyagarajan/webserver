const net = require('net')

const reqHeader = require('./reqHeader')
const serveStatic = require('./staticfiles')

const server = net.createServer()

server.on('connection', function (socket) {
  const address = socket.remoteAddress + ':' + socket.remotePort
  console.log('server is connected' + address)

  socket.on('data', function (data) {
    data = String(data)
    if (!data.trim('\n')) return
    try {
      const reqObj = reqHeader(data)
      serveStatic(reqObj, socket)
    } catch (err) {
      console.log(err)
    }
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
