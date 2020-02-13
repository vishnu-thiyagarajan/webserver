const net = require('net')

const reqHeader = require('./reqHeader')
const routeSwitch = require('./routing')
const routeMap = require('./routeMap')

const server = net.createServer()
server.on('connection', function (socket) {
  const address = socket.remoteAddress + ':' + socket.remotePort
  console.log('connection created on ' + address)
  let header; let body; let reqObj; let reqStr = ''
  let begins = 1
  socket.on('data', async function (data) {
    reqStr = data.toString()
    if (begins && reqStr.includes('\r\n\r\n')) {
      [header, ...body] = reqStr.split('\r\n\r\n')
      body = body.join('\r\n\r\n')
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

module.exports = server
