function parseMultipart (body, contentType) {
  const formList = []
  const bound = '--' + contentType.split('; boundary=')[1]
  for (const item of body.split(bound).slice(1)) {
    if (item.trim('\r\n') === '--') break
    const [metaData, data] = item.split('\r\n\r\n')
    const parsedObj = parseMeta(metaData)
    parsedObj.value = data.trim('\r\n')
    formList.push(parsedObj)
  }
  return formList
}

function parseMeta (metaData) {
  const obj = {}
  for (const kv of metaData.split(/;|\r\n/).slice(1)) {
    const [key, value] = kv.trim('\r\n').split(/:|=/)
    obj[key] = value
  }
  return obj
}

module.exports = parseMultipart
