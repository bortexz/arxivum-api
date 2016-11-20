function fsStreamPromise (stream) {
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve())
    stream.on('error', (e) => reject(e))
  })
}

module.exports = {
  fsStreamPromise
}
