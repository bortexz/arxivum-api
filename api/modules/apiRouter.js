const KoaRouter = require('koa-router')

const apiRouter = new KoaRouter({
  prefix: '/api'
})

const isAuthenticated = require('../middleware/authentication').isAuthenticated
// Features routes
const usersRouter = require('../services/users/router')
apiRouter.use('/users', isAuthenticated, usersRouter.routes(), usersRouter.allowedMethods())

const filesRouter = require('../services/files/router')
apiRouter.use('/files', /* isAuthenticated, */ filesRouter.routes(), filesRouter.allowedMethods())

// Auth
const authenticate = require('../services/users/authenticate')
apiRouter.post('/authenticate', authenticate)


module.exports = apiRouter
