module.exports = function (req, res, next) {
  if (!req.body) { req.body = {}; return }
  const contentType = req['Content-Type'].trim()
  if (contentType === 'application/json') req.body = JSON.parse(req.body)
  if (contentType === 'text/html') req.body = String(req.body)
  if (contentType === 'application/x-www-form-urlencoded') {
    const items = req.body.split('&')
    req.body = {}
    for (const kv of items) {
      const [key, value] = kv.split('=')
      req.body[key] = value
    }
  }
  next()
}
