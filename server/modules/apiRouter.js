const KoaRouter = require('koa-router')

const apiRouter = new KoaRouter({
  prefix: '/api'
})

const isAuthenticated = require('../middleware/authentication').isAuthenticated
// Features routes
const usersRouter = require('../features/users/router')
apiRouter.use('/users', isAuthenticated, usersRouter.routes(), usersRouter.allowedMethods())

// Auth
const authenticate = require('../features/users/authenticate')
apiRouter.post('/authenticate', authenticate)

module.exports = apiRouter
