const KoaRouter = require('koa-router')

const apiRouter = new KoaRouter({
  prefix: '/api'
})

/* SERVICES */
// users
const usersRouter = require('../services/users/router')
apiRouter.use(
  '/users',
  usersRouter.routes(),
  usersRouter.allowedMethods()
)
// files
const filesRouter = require('../services/files/router')
apiRouter.use(
  '/files',
  filesRouter.routes(),
  filesRouter.allowedMethods()
)

// folders
const foldersRouter = require('../services/folders/router')
apiRouter.use(
  '/folders',
  foldersRouter.routes(),
  foldersRouter.allowedMethods()
)
// invitations

// auth
const authenticateRouter = require('../services/authentication/router')
apiRouter.use(
  '/authenticate',
  authenticateRouter.routes(),
  authenticateRouter.allowedMethods()
)

// invitations
const invitationsRouter = require('../services/invitations/router')
apiRouter.use(
  '/invitations',
  invitationsRouter.routes(),
  invitationsRouter.allowedMethods()
)

module.exports = apiRouter
