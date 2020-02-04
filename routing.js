const urldecode = require('./urldecode')

const matchRoutes = {
  GET: ['getRoutes', 'getUrlRoutes'],
  POST: ['postRoutes', 'postUrlRoutes'],
  PUT: ['putRoutes', 'putUrlRoutes'],
  DELETE: ['deleteRoutes', 'deleteUrlRoutes']
}

const routeSwitch = function (reqObj, routeMap, socket) {
  const res = {}
  res.status = (code) => {
    socket.write('HTTP/1.1' + code + '\n')
    return res
  }
  res.send = (data) => {
    const now = new Date()
    const expiry = new Date().setDate(now.getDate() + 7)
    socket.write('Content-Type: text/html\nDate :' + now + '\n')
    socket.write('Expires :' + new Date(expiry) + '\n')
    socket.write('Content-Length:' + data.length + '\n\n')
    socket.write(Buffer.from(data, 'utf8'))
    socket.destroy()
  }
  const [route, urlRoute] = matchRoutes[reqObj.method]
  const matchFn = routeMap[route].get(reqObj.reqPath)
  if (matchFn) return matchFn(reqObj, res)
  const obj = urldecode(reqObj.reqPath, routeMap[urlRoute])
  if (obj) { reqObj.params = obj.params; obj.fn(reqObj, res) }
}

module.exports = routeSwitch
