const reqHeader = function (data) {
  let requestHeader = data.split(/\n/)
  const [method, url, protocol] = requestHeader[0].split(' ')
  const reqHead = { method: method, url: url, protocol: protocol }
  reqHead.reqpath = url.split('?')[0]
  reqHead.reqparams = {}
  if (url.split('?')[1]) {
    const reqparamsList = url.split('?')[1].split('&')
    for (const item in reqparamsList) {
      var [key, value] = item.split('=')
      reqHead.reqparams[key] = value
    }
  }
  requestHeader = requestHeader.slice(1)
  requestHeader.forEach(element => {
    var [key, value] = element.split(':')
    reqHead[key] = value
  })
  return reqHead
}
module.exports = reqHeader
