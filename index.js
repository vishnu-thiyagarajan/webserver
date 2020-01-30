const net = require('net')
const path = require('path')
const dir = path.join(__dirname, 'public')
const fs = require('fs')
const fileExt = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript'
}

const server = net.createServer()

server.on('connection', function (socket) {
  const address = socket.remoteAddress + ':' + socket.remotePort
  console.log('server is connected' + address)

  socket.on('data', function (data) {
    let body
    data = String(data)
    if (!data) return
    const [method, url, protocol] = data.split(/\n/)[0].split(' ')
    var reqpath = url.toString().split('?')[0]
    if (method !== 'GET') {
      body = 'Method not implemented'
      socket.write('HTTP/1.1 501 Not Implemented\n')
      socket.write('Content-Type: text/plain\n')
      socket.write('Content-Length: ' + body.length + '\n\n')
      socket.write(body)
      socket.destroy()
      return
    }
    var file = path.join(dir, reqpath.replace(/^\/$/, '/index.html'))
    fs.access(file, (err) => {
      if (err) {
        body = 'Not Found'
        socket.write('HTTP/1.1 404 Not Found\n')
        socket.write('Content-Type: text/plain\n')
        socket.write('Content-Length: ' + body.length + '\n\n')
        socket.write(body)
        socket.destroy()
      }
    })
    fs.access(file, fs.constants.R_OK, (err) => {
      if (err) {
        body = 'Forbidden'
        socket.write('HTTP/1.1 403 Forbidden\n')
        socket.write('Content-Type: text/plain\n')
        socket.write('Content-Length: ' + body.length + '\n\n')
        socket.write(body)
        socket.destroy()
      }
    })
    const type = fileExt[path.extname(file).slice(1)] || 'text/plain'
    fs.readFile(file, function (err, data) {
      if (err) {
        body = 'Not Found'
        socket.write('HTTP/1.1 404 Not Found\n')
        socket.write('Content-Type: text/plain\n')
        socket.write('Content-Length: ' + body.length + '\n\n')
        socket.write(body)
        socket.destroy()
      } else {
        socket.write('HTTP/1.1 200 OK\n')
        socket.write('Content-Type: ' + type + '\n')
        socket.write('Content-Length: ' + data.byteLength + '\n\n')
        socket.write(data)
        socket.destroy()
      }
    })
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
