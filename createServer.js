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
    reqStr = data
    reqStr = reqStr.toString()
    if (begins) {
      header = reqStr.split('\r\n\r\n')[0]
      body = data.slice(data.indexOf('\r\n\r\n'))
      reqObj = reqHeader(header)
      reqStr = Buffer.from('')
      begins = 0
    }
    if (!begins && reqObj['Content-Length'] && reqObj['Content-Length'] * 1 > body.byteLength) body = Buffer.concat([body, data])
    if (!reqObj['Content-Length'] || reqObj['Content-Length'] * 1 <= body.byteLength) {
      reqObj.body = body.slice(0, reqObj['Content-Length'] * 1)
      try {
        await routeSwitch(reqObj, routeMap, socket)
      } catch (err) {
        console.log(err)
      }
      reqStr = Buffer.from('')
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
  socket.setTimeout(4000)
})

module.exports = server
