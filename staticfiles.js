const fs = require('fs').promises
const path = require('path')
const dir = path.join(__dirname, 'public')
const res = 'Access-Control-Allow-Origin: *\r\nAccess-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept\r\n'
const fileExt = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  ico: 'image/vnd',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript'
}

const writeSocket = async function (reqObj) {
  const writeObj = {}
  if (reqObj.method !== 'GET') {
    writeObj.body = 'Method not implemented'
    writeObj.status = 'HTTP/1.1 501 Not Implemented\n'
    writeObj.type = 'text/plain\n'
    return writeObj
  }
  const file = path.join(dir, reqObj.reqPath.replace(/^\/$/, '/index.html'))
  if (!path.extname(file)) return writeObj
  const type = fileExt[path.extname(file).slice(1)] || 'text/plain'
  try {
    writeObj.body = await fs.readFile(file)
    writeObj.status = 'HTTP/1.1 200 OK\n'
    writeObj.type = type
  } catch {
    writeObj.body = 'Not Found'
    writeObj.status = 'HTTP/1.1 404 Not Found\n'
    writeObj.type = 'text/plain\n'
  }
  return writeObj
}

async function serveStatic (reqObj, socket) {
  try {
    const obj = await writeSocket(reqObj)
    if (!obj.status || obj.status !== 'HTTP/1.1 200 OK\n') {
      return obj
    }
    const now = new Date()
    const expiry = new Date().setDate(now.getDate() + 7)
    await socket.write(obj.status)
    await socket.write('Content-Type: ' + obj.type + '\n')
    await socket.write('Date :' + now + '\n')
    await socket.write('Expires :' + new Date(expiry) + '\n')
    await socket.write('Content-Length: ' + obj.body.length + '\n\n')
    await socket.write(obj.body)
    await socket.destroy()
  } catch {
    socket.write('HTTP/1.1 400 Badrequest')
    socket.write('Content-Type: text/plain\n')
    socket.write('Content-Length: 0\n\n')
    socket.write(Buffer.from('400 Badrequest', 'utf8'))
    socket.destroy()
  }
}
module.exports = serveStatic
