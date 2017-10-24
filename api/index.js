const app = require('./app')
const http = require('http')
const { API_PORT } = require('../config/')
const log = require('./modules/logger')('arxivum:api')
const mongoose = require('mongoose')

let server
const db = require('./modules/database')
db.connect().then(() => {
  server = http.createServer(app.callback()).listen(API_PORT)

  server.on('close', () => mongoose.disconnect())
  server.on('connect', () => {
    // Init database
    // require('./modules/database')
  })
})

log('App listening on port 3000')
