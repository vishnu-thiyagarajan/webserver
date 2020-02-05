const urlparse = require('./urlparse')

const matchRoutes = {
  GET: ['getRoutes', 'getUrlRoutes'],
  POST: ['postRoutes', 'postUrlRoutes'],
  PUT: ['putRoutes', 'putUrlRoutes'],
  DELETE: ['deleteRoutes', 'deleteUrlRoutes']
}

const routeSwitch = async function (reqObj, routeMap, socket) {
  const res = {}
  res.status = (code) => {
    socket.write(Buffer.from('HTTP/1.1' + code + '\r\n'))
    return res
  }
  res.send = (data) => {
    let writeStr = 'Content-Type: *\r\n'
    if (/(<([^>]+)>)/i.test(data)) writeStr = 'Content-Type: text/html\r\n'
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
    socket.write(Buffer.from(writeStr + data))
    socket.destroy()
  }
  for (const func of routeMap.middleware) {
    if (socket.destroyed) break
    func(reqObj, res, () => {})
  }
  const [route, urlRoute] = matchRoutes[reqObj.method]
  const matchFn = routeMap[route].get(reqObj.reqPath)
  if (matchFn) matchFn(reqObj, res, () => {})
  if (socket.destroyed) return
  if (!matchFn) {
    const obj = urlparse(reqObj.reqPath, routeMap[urlRoute])
    if (obj) { reqObj.params = obj.params; obj.fn(reqObj, res, () => {}) }
  }
  socket.destroy()
}

module.exports = routeSwitch
