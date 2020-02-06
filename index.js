const net = require('net')

const reqHeader = require('./reqHeader')
const serveStatic = require('./staticfiles')
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

  socket.on('data', async function (data) {
    socket.setKeepAlive(true)
    const reqObj = await reqHeader(data)
    await routeSwitch(reqObj, routeMap, socket)
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
const path = require('path')
const dir = path.join(__dirname, 'public')
const bodyparser = require('./bodyparser')
const urlCheck = function (req, res, next) {
  res.status(200).send(req.body)
}
const ser = app()
ser.listen(8000, () => {
  console.log('App running on port 8000.')
})
ser.use(bodyparser)
ser.use(serveStatic(dir))
ser.post('/check', urlCheck)
ser.get('/check', urlCheck)
ser.use((req, res, next) => {
  res.status(404).send('<h1>404 page not found</h1>')
})
// const Pool = require('pg').Pool
// const pool = new Pool({
//   user: 'api_user',
//   host: 'localhost',
//   database: 'todo_api',
//   password: 'password',
//   port: 5432
// })

// const getData = async (request, response) => {
//   try {
//     const result = await pool.query('SELECT * FROM lists')
//     const data = result.rows
//     for (const ind in data) {
//       try {
//         const res2 = await pool.query(
//           `select * from taskobjs where listid=${data[ind].id};`
//         )
//         data[ind].taskobjs = res2.rows
//       } catch (e) {
//         response.status(500).send('unable to fetch data')
//       }
//     }
//     console.log(data)
//     response.status(200).send(data)
//   } catch (e) {
//     response.status(500).send('unable to fetch data')
//   }
// }
// get('/todo', getData)

// const check = function (req, res, next) {
//   // res.status(200).send('<h1>reached hereeee</h1>')
//   req.next = true
//   res.next = true
//   console.log('next is called')
//   next()
// }
// get('/check', check)
