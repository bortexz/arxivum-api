const KoaRouter = require('koa-router')
const foldersRouter = new KoaRouter()
const {
  getFolder,
  createFolder
} = require('./middleware')

const {
  isAdmin
} = require('../../middleware/authorization')

// If !id, then return root folders with root files
foldersRouter.get('/:id?', isAdmin, getFolder)

foldersRouter.post('/', isAdmin, createFolder)

module.exports = foldersRouter

