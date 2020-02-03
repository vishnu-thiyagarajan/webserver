const net = require('net')

const reqHeader = require('./reqHeader')
const serveStatic = require('./staticfiles')

const server = net.createServer()
const check = async function (req, res) {
  res.status(200).send('reached hereeee')
}
server.on('connection', function (socket) {
  const address = socket.remoteAddress + ':' + socket.remotePort
  console.log('connection created on ' + address)

  socket.on('data', async function (data) {
    const reqObj = await reqHeader(data)
    const result = await serveStatic(reqObj, socket)
    if (result) {
      const res = {}
      res.status = (code) => {
        socket.write('HTTP/1.1' + code + '\n')
        return res
      }
      res.send = (data) => {
        const now = new Date()
        const expiry = new Date().setDate(now.getDate() + 7)
        socket.write('Content-Type: text/plain\n')
        socket.write('Date :' + now + '\n')
        socket.write('Expires :' + new Date(expiry) + '\n')
        socket.write('Content-Length:' + data.length + '\n\n')
        socket.write(data)
        socket.destroy()
      }
      if (reqObj.reqPath === '/check') await check(reqObj, res)
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
