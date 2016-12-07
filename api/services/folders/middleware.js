const Folder = require('./model')
const File = require('../files/model')
const { FILE_SCREEN } = require('../files/middleware')
const log = require('../../modules/logger')('arxivum:api:folders')

module.exports = {
  getFolder,
  createFolder,
  updateFolder,
  deleteFolder
}

const FOLDER_LIST_SCREEN = 'name description parent'

/**
 * Returns a folder with all of it's files and folder childs.
 * TODO : Ideally, don't need 3 DB calls for this.
 * Having many-many with links in both models overcomplicated for now
 * to maintain consistency.
 */
async function getFolder (ctx, next) {
  const folderId = ctx.params.id || null
  try {
    let folderPromise
    if (folderId) {
      folderPromise = Folder
      .findOne({_id: folderId})
      .lean()
    } else {
      folderPromise = Promise.resolve({
        name: 'root'
      })
    }

    const childFoldersPromise = Folder
      .find({parent: folderId})
      .select(FOLDER_LIST_SCREEN)

    const filesPromise = File
      .find({folder: folderId})
      .select(FILE_SCREEN)

    let [folder, childFolders, files] =
      await Promise.all([folderPromise, childFoldersPromise, filesPromise])

    if (folder === null) {
      throw new Error('FolderNotFound')
    }

    // folder = folder.toJSON ? folder.toJSON() : folder // If mongoose obj, json()
    folder.childFolders = childFolders
    folder.files = files

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
  const body = ctx.request.body
  const newFolder = new Folder(body)
  try {
    const folderSaved = await newFolder.save()
    ctx.body = folderSaved
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

async function updateFolder (ctx, next) {
  ctx.body = 'Not implemented yet'
}

async function deleteFolder (ctx, next) {
  ctx.body = 'Not implemented yet'
}
