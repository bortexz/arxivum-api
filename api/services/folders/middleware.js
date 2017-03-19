const foldersController = require('./controller')
const filesController = require('../files/controller')
const log = require('../../modules/logger')('arxivum:api:folders')

module.exports = {
  getFolder,
  createFolder,
  updateFolder,
  deleteFolder,
  getTree
}

const FOLDER_LIST_SCREEN = 'name parent path'

/**
 * Returns a folder with all of it's files and folder childs.
 */
async function getFolder (ctx, next) {
  const folderId = ctx.params.id || null
  try {
    const folderPromise = foldersController.getFolder(folderId, FOLDER_LIST_SCREEN)
    const childFoldersPromise = foldersController.getChildrenFolders(folderId)
    const filesPromise = filesController.getFiles(folderId)

    let [folder, childFolders, files] =
      await Promise.all([folderPromise, childFoldersPromise, filesPromise])

    if (folder === null) {
      throw new Error('FolderNotFound')
    }

    let ancestors = []
    if (folder.getAncestors) {
      ancestors = await folder.getAncestors({}, '_id name').exec()
      folder = folder.toJSON() // It's not root
    }

    folder.folders = childFolders
    folder.files = files
    folder.ancestors = ancestors

    ctx.body = folder
  } catch (e) {
    if (e.name === 'CastError') {
      ctx.throw(400, 'Invalid ID')
    }
    if (e.message === 'UserNotFound') {
      ctx.throw(404, 'User not found')
    }
    log(e)
    throw new Error()
  }
}

/**
 * Creates a new folder
 */
async function createFolder (ctx, next) {
  try {
    ctx.body = await foldersController.createFolder(ctx.request.body)
  } catch (e) {
    if (e.code === 11000) {
      ctx.throw(400, 'This user already exists')
    }
    if (e.name === 'ValidationError') {
      ctx.throw(400, 'Incorrect data')
    }
    throw new Error()
  }
}

async function getTree (ctx, next) {
  try {
    ctx.body = await foldersController.getFolderTree()
  } catch (e) {
    log('Error retrieving folder tree', e)
    ctx.throw(500, 'Error retrieving folder tree')
  }
}

async function updateFolder (ctx, next) {
  ctx.body = 'Not implemented yet'
}

async function deleteFolder (ctx, next) {
  ctx.body = 'Not implemented yet'
}
