const R = require('ramda')

const filesController = require('../files/controller')
const Folder = require('./model')
const E = require('./errors')
const log = require('../../modules/logger')('arxivum:api:folders:controller')

module.exports = {
  getFolder,
  getChildrenFolders,
  createFolder,
  getFolderTree,
  updateFolder,
  deleteFolder
}

async function getFolder (id, fields = 'name parent path') {
  return id
    ? await Folder.findOne({_id: id}).select(fields)
    : { name: 'root' }
}

/**
 * Returns the children folders of the given folder id.
 * @param {string} id of the parent
 */
async function getChildrenFolders (id) {
  return await Folder.find({ parent: id })
}

/** helper for biuldTree */
const _buildBranch = (root, folders) => {
  // find childs
  let childs = R.filter(child =>
    child.parent && child.parent.equals(root._id), folders)
  if (childs.length === 0) return undefined

  return R.map(child => {
    child.children = _buildBranch(child, folders)
    return child
  }, childs)
}

/**
 * Builds the tree of folders of the app
 */
const _buildTree = (folders) => {
  folders = R.map(R.pick(['_id', 'name', 'parent']), folders)
  let roots = R.filter(folder => !folder.parent, folders)

  return R.map(root => {
    root.children = _buildBranch(root, folders)
    return root
  }, roots)
}

async function getFolderTree () {
  const folders = await Folder.find() // Get all of them
  return _buildTree(folders)
}

async function createFolder (data) {
  const newFolder = new Folder(data)
  return newFolder.save()
}

async function updateFolder (id, { name }) {
  return await Folder.findOneAndUpdate({
    _id: id
  }, { name })
}

/**
 * Function that promisifies the getChildrenTree schema method
 * @param {*} folder Mongoose folder document
 */
const _getChildrenTreePromisified = folder =>
  new Promise((resolve, reject) => {
    folder.getChildrenTree({ recursive: true, allowEmptyChildren: true },
      (err, tree) => {
        err ? reject(err) : resolve(tree)
      })
  })

/**
 * Function that receives a tree of folders and removes it recursively
 */
async function _deleteFolderTree (root) {
  try {
    // Delete children
    await Promise.all(
      R.map(async folder => await _deleteFolderTree(folder), root.children)
    )
    // Delete related files
    await filesController.deleteFiles({ folder: root._id })
    // Delete folder
    return await Folder.remove({ _id: root._id })
  } catch (err) {
    throw err
  }
}

async function deleteFolder (_id) {
  const folder = await Folder.findOne({ _id })
  try {
    const childrenTree = await _getChildrenTreePromisified(folder)
    folder.children = childrenTree
  } catch (err) {
    log(err)
    throw new Error(E.GET_CHILDREN_TREE_ERROR)
  }
  try {
    return await _deleteFolderTree(folder)
  } catch (err) {
    log(err)
    throw new Error()
  }
}
