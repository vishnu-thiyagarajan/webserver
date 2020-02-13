const parseMultipart = require('./multipartParser')
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
