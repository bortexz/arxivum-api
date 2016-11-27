const KoaRouter = require('koa-router')
const filesRouter = new KoaRouter()
const { isAdmin } = require('../../middleware/authorization')
const {
  getFile,
  getFiles,
  deleteFile,
  // Upload functions
  loadFiles,
  encryptAndStore,
  generateTorrents,
  saveModels,
  completeUpdate
} = require('./middleware')

filesRouter.get('/:id', getFile)
filesRouter.get('/', getFiles)
filesRouter.del('/:id', deleteFile)

filesRouter.post('/',
  isAdmin,
  loadFiles,
  encryptAndStore,
  generateTorrents,
  saveModels,
  completeUpdate)

module.exports = filesRouter
