const KoaRouter = require('koa-router')
const filesRouter = new KoaRouter()
const fileMiddleware = require('./middleware')
// const userMiddleware = require('../users/middleware')


filesRouter.get('/:id', fileMiddleware.getFile)
filesRouter.get('/', fileMiddleware.getFiles)
filesRouter.del('/:id', fileMiddleware.deleteFile)

filesRouter.post('/',
  // userMiddleware.isAdmin,
  fileMiddleware.loadFiles,
  fileMiddleware.encryptAndStore,
  fileMiddleware.generateTorrents,
  fileMiddleware.saveModels,
  fileMiddleware.completeUpdate)

module.exports = filesRouter
