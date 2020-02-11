const net = require('net')

const reqHeader = require('./reqHeader')
const routeSwitch = require('./routing')

const server = net.createServer()
const routeMap = {
  middleware: [],
  getRoutes: new Map(),
  getUrlRoutes: new Map(),
  postRoutes: new Map(),
  postUrlRoutes: new Map(),
  putRoutes: new Map(),
  putUrlRoutes: new Map(),
  deleteRoutes: new Map(),
  deleteUrlRoutes: new Map()
}

server.on('connection', function (socket) {
  const address = socket.remoteAddress + ':' + socket.remotePort
  console.log('connection created on ' + address)
  let header; let body; let reqObj; let reqStr = ''
  let begins = 1
  socket.on('data', async function (data) {
    reqStr = data.toString()
    if (begins && reqStr.includes('\r\n\r\n')) {
      [header, body] = reqStr.split('\r\n\r\n')
      reqStr = ''
      reqObj = reqHeader(header)
      begins = 0
    }
    if (reqObj['Content-Length'] && reqObj['Content-Length'] * 1 > body.length) {
      body += reqStr
    }
    if (!reqObj['Content-Length'] || reqObj['Content-Length'] * 1 <= body.length) {
      reqObj.body = body.slice(0, reqObj['Content-Length'] * 1)
      await routeSwitch(reqObj, routeMap, socket)
      reqStr = ''
      begins = 1
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
