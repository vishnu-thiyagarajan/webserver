const net = require('net')

const reqHeader = require('./reqHeader')
const serveStatic = require('./staticfiles')
const routeSwitch = require('./routing')

const server = net.createServer()

const routeMap = {
  getRoutes: new Map(),
  getUrlRoutes: new Map(),
  postRoutes: new Map(),
  postUrlRoutes: new Map(),
  putRoutes: new Map(),
  putUrlRoutes: new Map(),
  deleteRoutes: new Map(),
  deleteUrlRoutes: new Map()
}

function get (route, fn) {
  const cond = route.includes('/:')
  if (cond) routeMap.getUrlRoutes.set(route, fn)
  if (!cond) routeMap.getRoutes.set(route, fn)
}

function post (route, fn) {
  const cond = route.includes('/:')
  if (cond) routeMap.postUrlRoutes.set(route, fn)
  if (!cond) routeMap.postRoutes.set(route, fn)
}

function put (route, fn) {
  const cond = route.includes('/:')
  if (cond) routeMap.putUrlRoutes.set(route, fn)
  if (!cond) routeMap.putRoutes.set(route, fn)
}

function del (route, fn) {
  const cond = route.includes('/:')
  if (cond) routeMap.deleteUrlRoutes.set(route, fn)
  if (!cond) routeMap.deleteRoutes.set(route, fn)
}

// function use (route, router){
// }

const check = function (req, res) {
  res.status(200).send('<h1>reached hereeee</h1>')
}
const urlCheck = function (req, res) {
  res.status(200).send('reached...' + req.params.id)
}
get('/check/:id', urlCheck)
get('/check', check)

server.on('connection', function (socket) {
  const address = socket.remoteAddress + ':' + socket.remotePort
  console.log('connection created on ' + address)

  socket.on('data', async function (data) {
    const reqObj = await reqHeader(data)
    const result = await serveStatic(reqObj, socket)
    if (result) await routeSwitch(reqObj, routeMap, socket)
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
