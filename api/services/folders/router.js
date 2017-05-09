const KoaRouter = require('koa-router')
const foldersRouter = new KoaRouter()
const {
  getFolder,
  createFolder,
  getTree,
  updateFolder,
  deleteFolder
} = require('./middleware')

const { isAuthenticated } = require('../../middleware/authentication')

const { isAdmin } = require('../../middleware/authorization')

// If !id, then return root folders with root files
foldersRouter.get('/tree', isAuthenticated, getTree)
foldersRouter.get('/:id?', isAuthenticated, getFolder)
foldersRouter.post('/', isAuthenticated, isAdmin, createFolder)
foldersRouter.patch('/:id', isAuthenticated, isAdmin, updateFolder)
foldersRouter.del('/:id', isAuthenticated, isAdmin, deleteFolder)

module.exports = foldersRouter

