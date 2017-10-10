// Environment
global.ENV = process.env.NODE_ENV || 'dev'

const Koa = require('koa')
const cors = require('koa-cors')
const log = require('./modules/logger')('arxivum:api')

const { API_PORT, PUBLIC_URL } = require('../config/')

const app = new Koa()

// Init database
require('./modules/database')

// TODO: Remove by default, allow by options.
let corsOpts
if (process.env.NODE_ENV === 'prod') {
  corsOpts = {
    origin: PUBLIC_URL,
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH']
  }
} else {
  corsOpts = {
    credentials: true,
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH']
  }
}

app.use(cors(corsOpts))

// Global middlewares
const logger = require('./middleware/requestLogger')
app.use(logger)

const errorHandler = require('./middleware/errorHandler')
app.use(errorHandler)

const bodyParser = require('koa-bodyparser')
app.use(bodyParser())

// Init API routes
const apiRouter = require('./modules/apiRouter')
app.use(apiRouter.routes())

app.listen(API_PORT)

log('App listening on port 3000')
