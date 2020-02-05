module.exports = function (req, res, next) {
  if (!req.body) { req.body = {}; return }
  if ((req['Content-Type'] === 'application/json')) req.body = JSON.parse(req.body)
  if ((req['Content-Type'] === 'text/html')) req.body = String(req.body)
  next()
}
