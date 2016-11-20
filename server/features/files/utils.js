let createTorrent = require('create-torrent')

function fsStreamPromise (stream) {
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve())
    stream.on('error', (e) => reject(e))
  })
}

function createTorrentPromise (path, opts) {
  return new Promise((resolve, reject) => {
    createTorrent(path, opts, (err, torrent) => {
      if (err) return reject(err)
      else resolve(torrent)
    })
  })
}
module.exports = {
  fsStreamPromise,
  createTorrentPromise
}
