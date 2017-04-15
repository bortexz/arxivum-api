const createTorrent = require('create-torrent')

function createTorrentPromise (path, opts) {
  return new Promise((resolve, reject) => {
    createTorrent(path, opts, (err, torrent) => {
      if (err) return reject(err)
      else resolve(torrent)
    })
  })
}

module.exports = {
  createTorrentPromise
}
