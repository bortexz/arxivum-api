const KoaRouter = require('koa-router')
const filesRouter = new KoaRouter()
const fileMiddleware = require('./middleware')
// const userMiddleware = require('../users/middleware')
filesRouter.post('/',
  // userMiddleware.isAdmin,
  fileMiddleware.loadFiles,
  fileMiddleware.encryptAndStore)

module.exports = filesRouter
