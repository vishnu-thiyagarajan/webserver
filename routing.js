const urlparse = require('./urlparse')
const buildRes = require('./buildResponse')

const matchRoutes = {
  GET: ['getRoutes', 'getUrlRoutes'],
  POST: ['postRoutes', 'postUrlRoutes'],
  PUT: ['putRoutes', 'putUrlRoutes'],
  DELETE: ['deleteRoutes', 'deleteUrlRoutes']
}
let cookie = {}
const routeSwitch = async function (reqObj, routeMap, socket) {
  const res = {}
  res.status = (code) => {
    socket.write('HTTP/1.1 ' + code + '\r\n')
    return res
  }
  res.send = (data) => {
    const writeStr = buildRes(data, cookie, reqObj.reqPath)
    socket.write(Buffer.from(writeStr))
    socket.destroy()
    cookie = {}
  }
  res.cookie = (key, value, prop = {}) => {
    cookie[key] = [value, prop]
    return res
  }
  res.clearCookie = (key) => {
    delete cookie[key]
    return res
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

module.exports = routeSwitch
