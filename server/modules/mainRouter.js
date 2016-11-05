const KoaRouter = require('koa-router')

const apiRouter = new KoaRouter({
  prefix: '/api'
})

// Import routers
const usersRouter = require('../features/users/router')

apiRouter.use('/users', usersRouter.routes(), usersRouter.allowedMethods())

module.exports = apiRouter
