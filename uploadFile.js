const fs = require('fs').promises
const path = require('path')

function uploadFile (storagePath) {
  return async (req, res, next) => {
    if (!Array.isArray(req.body)) return next()
    const fileObj = req.body.filter(item => item['Content-Type'])[0]
    try {
      const filePath = path.join(storagePath, fileObj.filename.replace(/"/g, ''))
      await fs.writeFile(filePath, fileObj.value, function (err) {
        if (err) throw err
      })
    } catch (err) {
      res.status(200).send(err)
    }
    res.status(200).send('file Uploaded')
  }
}

module.exports = uploadFile
