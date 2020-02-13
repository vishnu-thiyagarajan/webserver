const routeMap = require('./routeMap')
const server = require('./createServer')
function app () {
  const obj = {}
  obj.listen = function (port, fn) {
    server.listen(port, fn)
  }
  obj.use = function (fn) {
    routeMap.middleware.push(fn)
  }
  obj.get = function (route, fn) {
    const cond = route.includes('/:')
    if (cond) routeMap.getUrlRoutes.set(route, fn)
    if (!cond) routeMap.getRoutes.set(route, fn)
    routeMap.middleware.push(route)
  }
  obj.post = function (route, fn) {
    const cond = route.includes('/:')
    if (cond) routeMap.postUrlRoutes.set(route, fn)
    if (!cond) routeMap.postRoutes.set(route, fn)
    routeMap.middleware.push(route)
  }
  obj.put = function (route, fn) {
    const cond = route.includes('/:')
    if (cond) routeMap.putUrlRoutes.set(route, fn)
    if (!cond) routeMap.putRoutes.set(route, fn)
    routeMap.middleware.push(route)
  }
  obj.del = function (route, fn) {
    const cond = route.includes('/:')
    if (cond) routeMap.deleteUrlRoutes.set(route, fn)
    if (!cond) routeMap.deleteRoutes.set(route, fn)
    routeMap.middleware.push(route)
  }
  return obj
}

module.exports = app
