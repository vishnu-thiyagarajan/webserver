const path = require('path')
const fs = require('fs')

const db = require('./queries')
const bodyparser = require('./bodyparser')
const cookieParser = require('./cookieParser')
const serveStatic = require('./staticfiles')
const app = require('./server')

const dir = path.join(__dirname, 'public')
const ser = app()
ser.listen(8000, () => {
  console.log('App running on port 8000.')
})
ser.use(bodyparser)
ser.use(cookieParser)
ser.use(serveStatic(dir))

function createFile (req, res, next) {
  const fileObj = req.body.filter(item => item['Content-Type'])[0]
  if (fileObj) {
    const filePath = path.join(__dirname, req.reqPath, fileObj.filename)
    try {
      fs.writeFile(filePath, fileObj.value, function (err) {
        if (err) throw err
      })
    } catch (err) {
      res.status(200).send(err)
    }
  }
  res.status(200).send('file Uploaded')
}

function submitForm (req, res, next) {
  res.status(200).send(req.body)
}

ser.post('/saveUploads', createFile)
ser.get('/todo', db.getData)
ser.post('/list', db.createList)
ser.put('/rename', db.updateList)
ser.del('/delete/:id', db.deleteList)
ser.post('/task', db.createTask)
ser.put('/taskdone', db.taskDone)
ser.put('/update', db.updateTask)
ser.del('/clear/:id', db.deleteTask)
ser.post('/submitForm', submitForm)

ser.use((req, res, next) => {
  res.status(404).send('<h1>404 page not found</h1>')
})
