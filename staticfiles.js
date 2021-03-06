const path = require('path')

const fs = require('fs').promises

function serveStatic (dir) {
  return async function (reqObj, res, next) {
    try {
      const filePath = path.join(dir, reqObj.reqPath.replace(/^\/$/, '/index.html'))
      if (!path.extname(filePath)) return next()
      const body = await fs.readFile(filePath)
      reqObj.reqPath = filePath
      await res.status(200).send(String(body))
    } catch (err) {
      res.status(500).send(err)
    }
  }
}

module.exports = serveStatic
