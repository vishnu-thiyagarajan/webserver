// function parseMultipart (body, contentType) {
//   const obj = { content: '' }
//   let start = true
//   const bound = contentType.split('; boundary=')[1].trim('-')
//   for (const line of body.split('\n')) {
//     if (line.includes(bound) && !start) break
//     if (line.includes(bound) && start) start = false
//     if (!line.includes(bound)) obj.content += line
//     obj.content += '\n'
//   }
//   obj.body = obj.content.split('\r\n\r\n')[1].trim('\r\n')
//   obj.content = obj.content.split('\r\n\r\n')[0].trim('\n')
//   for (const kv of obj.content.split(/;|\r\n/)) {
//     const [key, value] = kv.trim('\r\n').split(/:|=/)
//     obj[key] = value.trim('"')
//   }
//   obj.filename = obj.filename.slice(1, -1)
//   return obj
// }
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
  // if (obj.filename) obj.filename = obj.filename.slice(1, -1)
  return obj
}

module.exports = parseMultipart
