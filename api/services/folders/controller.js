const Folder = require('./model')
const R = require('ramda')

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

}

async function deleteFolder (id) {
  // Has to delete all files & folders inside !
}
