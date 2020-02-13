const path = require('path')

const db = require('./queries')
const bodyparser = require('./bodyparser')
const cookieParser = require('./cookieParser')
const serveStatic = require('./staticfiles')
const uploadFile = require('./uploadFile')

const app = require('./server')

const dir = path.join(__dirname, 'public')
const ser = app()
ser.listen(8000, () => {
  console.log('App running on port 8000.')
})
ser.use(bodyparser)
ser.use(cookieParser)
ser.use(serveStatic(dir))
ser.use(uploadFile(path.join(__dirname, '/saveUploads')))

function submitForm (req, res, next) {
  res.status(200).send(req.body)
}

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
