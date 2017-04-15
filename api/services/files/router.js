const KoaRouter = require('koa-router')
const filesRouter = new KoaRouter()
const { isAdmin } = require('../../middleware/authorization')
const { isAuthenticated } = require('../../middleware/authentication')
const {
  getFile,
  deleteFile,
  updateFile,
  uploadFiles
  // loadFiles,
  // encryptAndStore,
  // generateTorrents,
  // saveModels,
  // completeUpload
} = require('./middleware')

filesRouter.get('/:id', isAuthenticated, getFile)
filesRouter.del('/:id', isAuthenticated, isAdmin, deleteFile)
filesRouter.patch('/:id', isAuthenticated, isAdmin, updateFile)

filesRouter.post('/',
  isAuthenticated,
  isAdmin,
  uploadFiles)

module.exports = filesRouter
