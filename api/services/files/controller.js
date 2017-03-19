const File = require('./model')

module.exports = {
  getFiles
}

async function getFiles (folderId, fields = '_id name size torrent') {
  const files = await File
    .find({folder: folderId})
    .select(fields)
  return files
}
