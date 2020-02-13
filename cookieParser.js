function parseCookies (cookieString) {
  if (!cookieString) return {}
  const kvs = cookieString.split(';')
  const kvo = {}
  kvs.forEach(kv => { kvo[kv.split('=')[0].trim()] = kv.split('=')[1].trim() })
  return kvo
}

module.exports = function (req, res, next) {
  req.cookies = parseCookies(req.Cookie)
  for (const [key, value] of Object.entries(req.cookies)) {
    res.cookie(key, value)
  }
  next()
}
