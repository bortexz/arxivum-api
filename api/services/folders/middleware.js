const Folder = require('./model')
const File = require('../files/model')
const { FILE_SCREEN } = require('../files/middleware')
const log = require('../../modules/logger')('arxivum:api:folders')
const R = require('ramda')

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
      .select(FOLDER_LIST_SCREEN)
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

    let ancestors = []
    if (folder.getAncestors) {
      ancestors = await folder.getAncestors({}, '_id name').exec()
      console.log(ancestors)
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
  const body = ctx.request.body
  const newFolder = new Folder(body)
  try {
    ctx.body = await newFolder.save()
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

/** helper for biuldTree */
function buildBranch (root, folders) {
  // find childs
  let childs = R.filter(child =>
    child.parent && child.parent.equals(root._id), folders)
  if (childs.length === 0) return undefined

  return R.map(child => {
    child.children = buildBranch(child, folders)
    return child
  }, childs)
}

/**
 * Builds the tree of folders of the app
 */
function buildTree (folders) {
  folders = R.map(R.pick(['_id', 'name', 'parent']), roots)
  let roots = R.filter(folder => !folder.parent, folders)

  return R.map(root => {
    root.children = buildBranch(root, folders)
    return root
  }, roots)
}

async function getTree (ctx, next) {
  // get all folders
  const folders = await Folder.find() // Get all of them
  const tree = buildTree(folders)
  ctx.body = tree
}

async function updateFolder (ctx, next) {
  ctx.body = 'Not implemented yet'
}

async function deleteFolder (ctx, next) {
  ctx.body = 'Not implemented yet'
}
