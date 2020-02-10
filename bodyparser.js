module.exports = function (req, res, next) {
  if (!req.body) { req.body = {}; return }
  const contentType = req['Content-Type'].trim()
  if (contentType === 'application/json') req.body = JSON.parse(req.body)
  if (contentType === 'text/html') req.body = String(req.body)
  next()
}
