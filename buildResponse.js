const path = require('path')
const fileType = {
  html: 'text/html',
  txt: 'text/plain',
  css: 'text/css',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  ico: 'image/vnd',
  mp4: 'video/mp4',
  png: 'image/png',
  svg: 'image/svg+xml',
  js: 'application/javascript'
}

function buildRes (data, cookie, reqPath) {
  let writeStr = 'Content-Type: *\r\n'
  const fileExt = path.extname(reqPath).slice(1)
  if (!fileExt) writeStr = 'Content-Type: text/html\r\n'
  if (fileExt) writeStr = 'Content-Type: ' + (fileType[fileExt] || '*') + '\r\n'
  if (typeof data === 'object') {
    data = JSON.stringify(data)
    writeStr = 'Content-Type: application/json\r\n'
  }
  const now = new Date()
  const expiry = new Date().setDate(now.getDate() + 7)
  writeStr += 'Date :' + now + '\r\n'
  writeStr += 'Expires :' + new Date(expiry) + '\r\n'
  writeStr += 'Access-Control-Allow-Origin: *\r\nAccess-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept\r\n'
  writeStr += 'Keep-Alive: timeout=5, max=10000\r\n'
  writeStr += 'Content-Length:' + Buffer.from(data).byteLength
  if (Object.keys(cookie).length !== 0) {
    for (const [key, value] of Object.entries(cookie)) {
      writeStr += ';\r\nSet-Cookie: ' + key + '=' + value[0]
      if (Object.keys(value[1]).length !== 0) writeStr += ' ' + buildProps(value[1])
    }
  }
  return writeStr + '\r\n\r\n' + data
}

function buildProps (prop) {
  let propStr = ''
  for (const [key, value] of Object.entries(prop)) {
    propStr += key + '=' + String(value) + '; '
  }
  return propStr
}
module.exports = buildRes
