const urlparse = require('./urlparse')
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
const matchRoutes = {
  GET: ['getRoutes', 'getUrlRoutes'],
  POST: ['postRoutes', 'postUrlRoutes'],
  PUT: ['putRoutes', 'putUrlRoutes'],
  DELETE: ['deleteRoutes', 'deleteUrlRoutes']
}

const routeSwitch = async function (reqObj, routeMap, socket) {
  const res = {}
  res.status = (code) => {
    socket.write('HTTP/1.1 ' + code + '\r\n')
    return res
  }
  res.send = (data) => {
    const writeStr = buildRes(data, reqObj.reqPath)
    socket.write(Buffer.from(writeStr))
    socket.destroy()
  }
  for (const handler of routeMap.middleware) {
    if (socket.destroyed) break
    if (typeof handler !== 'string') await handler(reqObj, res, () => {})
    if (typeof handler === 'string') {
      const [route, urlRoute] = matchRoutes[reqObj.method]
      const matchFn = routeMap[route].get(reqObj.reqPath)
      if (matchFn) await matchFn(reqObj, res, () => {})
      if (!matchFn) {
        const obj = urlparse(reqObj, routeMap[urlRoute])
        if (obj) { reqObj.params = obj.params; await obj.fn(reqObj, res, () => {}) }
      }
    }
  }
}

function buildRes (data, reqPath) {
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
  writeStr += 'Content-Length:' + Buffer.from(data).byteLength + '\r\n\r\n'
  return writeStr + data
}
module.exports = routeSwitch
