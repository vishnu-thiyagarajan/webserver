const fs = require('fs')
const path = require('path')
const dir = path.join(__dirname, 'public')

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

const serveStatic = function (reqObj, socket) {
  let body
  if (reqObj.method !== 'GET') {
    body = 'Method not implemented'
    socket.write('HTTP/1.1 501 Not Implemented\n')
    socket.write('Content-Type: text/plain\n')
    socket.write('Content-Length: ' + body.length + '\n\n')
    socket.write(body)
    socket.destroy()
    return
  }
  const file = path.join(dir, reqObj.reqpath.replace(/^\/$/, '/index.html'))
  const type = fileExt[path.extname(file).slice(1)] || 'text/plain'
  fs.readFile(file, function (err, data) {
    if (err) {
      body = 'Not Found'
      socket.write('HTTP/1.1 404 Not Found\n')
      socket.write('Content-Type: text/plain\n')
      socket.write('Content-Length: ' + body.length + '\n\n')
      socket.write(body)
    } else {
      socket.write('HTTP/1.1 200 OK\n')
      socket.write('Content-Type: ' + type + '\n')
      socket.write('Content-Length: ' + data.byteLength + '\n\n')
      socket.write(Buffer.from(data, 'utf8'))
    }
  })
}
module.exports = serveStatic
