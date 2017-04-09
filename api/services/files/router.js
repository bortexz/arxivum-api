const KoaRouter = require('koa-router')
const filesRouter = new KoaRouter()
const { isAdmin } = require('../../middleware/authorization')
const { isAuthenticated } = require('../../middleware/authentication')
const {
  getFile,
  deleteFile,
  // Upload functions
  loadFiles,
  encryptAndStore,
  generateTorrents,
  saveModels,
  completeUpload
} = require('./middleware')

filesRouter.get('/:id', getFile)
filesRouter.del('/:id', isAuthenticated, isAdmin, deleteFile)

filesRouter.post('/',
  isAuthenticated,
  isAdmin,
  loadFiles,
  encryptAndStore,
  generateTorrents,
  saveModels,
  completeUpload)

module.exports = filesRouter
