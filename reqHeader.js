const reqHeader = function (data) {
  data = String(data)
  if (!data.trim('\n')) return {}
  let requestHeader = data.split(/\n/)
  const [method, url, protocol] = requestHeader[0].split(' ')
  const reqHead = { method: method, url: url, protocol: protocol }
  reqHead.reqPath = url.split('?')[0]
  reqHead.reqParams = {}
  if (url.split('?')[1]) {
    const reqParamsList = url.split('?')[1].split('&')
    for (const item in reqParamsList) {
      var [key, value] = item.split('=')
      reqHead.reqParams[key] = value
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
