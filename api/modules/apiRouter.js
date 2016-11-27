const KoaRouter = require('koa-router')

const apiRouter = new KoaRouter({
  prefix: '/api'
})

const isAuthenticated = require('../middleware/authentication').isAuthenticated
/* SERVICES */
// users
const usersRouter = require('../services/users/router')
apiRouter.use(
  '/users',
  isAuthenticated,
  usersRouter.routes(),
  usersRouter.allowedMethods()
)
// files
const filesRouter = require('../services/files/router')
apiRouter.use(
  '/files',
  isAuthenticated,
  filesRouter.routes(),
  filesRouter.allowedMethods()
)
// invitations

// auth
const authenticateRouter = require('../services/authentication/router')
apiRouter.use(
  '/authenticate',
  authenticateRouter.routes(),
  authenticateRouter.allowedMethods()
)

module.exports = apiRouter
