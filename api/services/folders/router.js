const KoaRouter = require('koa-router')
const foldersRouter = new KoaRouter()
const {
  getFolder,
  createFolder
} = require('./middleware')

const {
  isAuthenticated
} = require('../../middleware/authentication')

// If !id, then return root folders with root files
foldersRouter.get('/:id?', isAuthenticated, getFolder)

foldersRouter.post('/', isAuthenticated, createFolder)

module.exports = foldersRouter

