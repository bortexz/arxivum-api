const File = require('./model')
const asyncBusboy = require('async-busboy')
const path = require('path')
const fs = require('fs')
const qcrypto = require('crypto-promise')
const crypto = require('crypto')
const log = require('../../modules/logger')('arxivum:files:middleware')
const uuid = require('uuid')

const ENCRYPT_ALGO = 'aes-256-cbc'

module.exports = {
  getFile,
  getFiles,
  deleteFile,
  // Update specific
  loadFiles,
  encryptAndStore,
  generateTorrent,
  saveModel,
  updateComplete
}

// GET ONE
async function getFile (ctx, next) {
  await next()
}

// GET MANY
async function getFiles (ctx, next) {
  await next()
}

// DELETE
async function deleteFile (ctx, next) {
  await next()
}

// UPDATE Functions
async function loadFiles (ctx, next) {
  const {files} = await asyncBusboy(ctx.req)
  log('arrives here')
  ctx.files = files
  await next()
}

async function encryptAndStore (ctx, next) {
  // ctx.files exist

  // SAVE NORMAL FILE
  for (let file of ctx.files) {
    // Generate random filename for the encrypted file.
    file.encrypted_name = `${uuid()}.enc`

    const randomBytes = await qcrypto.randomBytes(256)
    file.encryption_key = randomBytes

    const encryptCipher = crypto.createCipher(ENCRYPT_ALGO, file.encryption_key)

    const encryptedFilePath = path.resolve(__dirname, '../../../files', file.encrypted_name)
    try {
      const encryptStream = file.pipe(encryptCipher).pipe(fs.createWriteStream(encryptedFilePath))

      encryptStream.on('finish', () => {
        log('Starting decryption!!!')

        const decryptCipher = crypto.createDecipher(ENCRYPT_ALGO, file.encryption_key)
        const decryptedFilePath = path.resolve(__dirname, '../../../files', file.filename)
        const decryptStream = fs.createReadStream(encryptedFilePath).pipe(decryptCipher).pipe(fs.createWriteStream(decryptedFilePath))
        decryptStream.on('end', () => {
          log('end decrypting!')
          ctx.status = 200
          next()
        })
      })
    } catch (e) {
      ctx.throw(new Error())
      log('error', e)
    }
    // file.pipe(fs.createWriteStream(saveTo))
  }

    // SAVE ENCRYPTED

    // SAVE DECRYPTED
}

// files.forEach(file => {
//   var saveTo = path.resolve(__dirname, '../../files', file.filename)
//   file.pipe(fs.createWriteStream(saveTo))
// })

async function generateTorrent (ctx, next) {

}

async function saveModel (ctx, next) {

}

async function updateComplete (ctx, next) {

}
