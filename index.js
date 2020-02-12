const path = require('path')
const fs = require('fs')

const db = require('./queries')
const bodyparser = require('./bodyparser')
const serveStatic = require('./staticfiles')
const app = require('./server')

const dir = path.join(__dirname, 'public')
const ser = app()
ser.listen(8000, () => {
  console.log('App running on port 8000.')
})
ser.use(bodyparser)
ser.use(serveStatic(dir))

function createFile (req, res, next) {
  const filePath = req.reqPath + '/' + req.body.filename.slice(1, -1)
  fs.writeFile(path.join(__dirname, filePath), req.body.body, function (err, file) {
    if (err) throw err
    console.log('Saved!')
  })
  res.status(200).send(req.body)
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
