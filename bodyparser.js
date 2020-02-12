module.exports = function (req, res, next) {
  if (!req.body) { req.body = {}; return }
  const contentType = req['Content-Type'].trim()
  if (contentType.startsWith('multipart/form-data')) req.body = parseMultipart(req.body, contentType)
  if (contentType === 'application/json') req.body = JSON.parse(req.body)
  if (contentType === 'text/html') req.body = String(req.body)
  if (contentType === 'application/x-www-form-urlencoded') req.body = decode(req.body, '&')
  next()
}

function decode (body, splitter) {
  const items = body.split(splitter)
  body = {}
  for (const kv of items) {
    const [key, value] = kv.split('=')
    body[key] = value
  }
  return body
}

function parseMultipart (body, contentType) {
  const obj = { content: '' }
  let start = true
  const bound = contentType.split('; boundary=')[1].trim('-')
  for (const line of body.split('\n')) {
    if (line.includes(bound) && !start) break
    if (line.includes(bound) && start) start = false
    if (!line.includes(bound)) obj.content += line
    obj.content += '\n'
  }
  obj.body = obj.content.split('\r\n\r\n')[1].trim('\r\n')
  obj.content = obj.content.split('\r\n\r\n')[0].trim('\n')
  for (const kv of obj.content.split(/;|\r\n/)) {
    const [key, value] = kv.trim('\r\n').split(/:|=/)
    obj[key] = value.trim('"')
  }
  console.log(obj)
  return obj
}
