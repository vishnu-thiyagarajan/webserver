const net = require('net')

const reqHeader = require('./reqHeader')
const serveStatic = require('./staticfiles')

const server = net.createServer()

const routeMap = {
  getRoutes: new Map(),
  getUrlRoutes: new Map(),
  postRoutes: new Map(),
  postUrlRoutes: new Map()
}
const matchRoutes = {
  GET: ['getRoutes', 'getUrlRoutes'],
  POST: ['postRoutes', 'postUrlRoutes']
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
const check = function (req, res) {
  res.status(200).send('reached hereeee')
}
const urlCheck = function (req, res) {
  res.status(200).send('reached...' + req.params.id)
}
get('/check', check)
get('/urlcheck/:id', urlCheck)

server.on('connection', function (socket) {
  const address = socket.remoteAddress + ':' + socket.remotePort
  console.log('connection created on ' + address)

  socket.on('data', async function (data) {
    const reqObj = await reqHeader(data)
    const result = await serveStatic(reqObj, socket)
    if (result) {
      const res = {}
      res.status = (code) => {
        socket.write('HTTP/1.1' + code + '\n')
        return res
      }
      res.send = (data) => {
        const now = new Date()
        const expiry = new Date().setDate(now.getDate() + 7)
        socket.write('Content-Type: text/plain\nDate :' + now + '\n')
        socket.write('Expires :' + new Date(expiry) + '\n')
        socket.write('Content-Length:' + data.length + '\n\n')
        socket.write(Buffer.from(data, 'utf8'))
        socket.destroy()
      }
      const [route, urlRoute] = matchRoutes[reqObj.method]
      const matchFn = routeMap[route].get(reqObj.reqPath)
      if (matchFn) return matchFn(reqObj, res)
      const urlPathArray = reqObj.reqPath.split('/').slice(1)
      for (const [key, value] of routeMap[urlRoute]) {
        reqObj.params = {}
        let flag = 0
        const routePathArray = key.split('/').slice(1)
        if (urlPathArray.length === routePathArray.length) {
          for (const index in urlPathArray) {
            if (routePathArray[index] !== urlPathArray[index]) {
              if (!routePathArray[index].startsWith(':')) { flag = 1; break }
              reqObj.params[routePathArray[index].slice(1)] = urlPathArray[index]
            }
          }
          if (!flag) { value(reqObj, res); break }
        }
      }
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
server.listen(8000, function () {
  console.log('server is listening' + JSON.stringify(server.address()))
})
