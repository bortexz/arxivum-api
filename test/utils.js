// Code to be executed before testing to prepare the environment
const TESTING_DATABASE_URL = 'mongodb://localhost/arxivum-testing'
const mongoose = require('mongoose')
const req = require('supertest')
const path = require('path')
const fs = require('fs')
/* Connect to the DB */

module.exports = {
  configTest,
  configDB,
  dropDB,
  disconnectDb,
  tick,
  authenticate,
  authenticateAdmin,
  createUser,
  deleteTestFiles
}

// General configuration
function configTest () {
  process.env.DEBUG = '*'
  process.env.API_PORT = 3030
  process.env.TRACKER_PORT = 4040
  process.env.WEBSEED_PORT = 5050
  process.env.WEBSEED_FOLDER = path.resolve(__dirname, './files')
  process.env.WEBSEED_ROOT = path.resolve(__dirname, './files')
}

// Database configuration
function configDB () {
  process.env.DATABASE_URL = TESTING_DATABASE_URL
}

async function disconnectDb () {
  mongoose.disconnect()
}

async function dropDB () {
  return new Promise((resolve, reject) => {
    var connection = mongoose.createConnection(TESTING_DATABASE_URL)
    connection.db.once('open', function () {
      connection.db.dropDatabase(function (err) {
        mongoose.disconnect()
        if (err) reject(err)
        resolve()
      })
    })
  })
}

async function tick (ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms)
  })
}

async function authenticate (server, email, password) {
  const res = await req(server)
    .post('/api/authenticate')
    .send({ email, password })

  return res.body.token
}

async function authenticateAdmin (server) {
  const token = await authenticate(server, 'admin@admin', 'admin')
  return token
}

async function createUser (server, user) {
  const token = await authenticateAdmin(server)

  const res = await req(server)
    .post('/api/users')
    .set('Authorization', 'Bearer ' + token)
    .send(user)

  return res.body
}

async function deleteTestFiles () {
  const dir = path.resolve(__dirname, './files')
  // Deletes all files undes 'files' folder
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(function (file, index) {
      var curPath = dir + '/' + file
      fs.unlinkSync(curPath)
    })
  }
}
