// const File = require('./model')
const asyncBusboy = require('async-busboy')
const path = require('path')
const fs = require('fs')
const qcrypto = require('crypto-promise')
const crypto = require('crypto')
const log = require('../../modules/logger')('arxivum:files:middleware')
const uuid = require('uuid')
const {fsStreamPromise} = require('./utils')
const {WEBSEED_FOLDER} = require('../../config')

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
  ctx.files = files
  await next()
}

async function encryptAndStore (ctx, next) {
  let writeFilePromises = []

  // Normally, we will receive 1 request per file
  for (let file of ctx.files) {
    // Generate random filename for the encrypted file.
    file.encrypted_name = `${uuid()}.enc`

    try {
      // Random Buffer encryption_key
      const randomBytes = await qcrypto.randomBytes(256)
      file.encryption_key = randomBytes

      const encryptCipher = crypto.createCipher(ENCRYPT_ALGO, file.encryption_key)

      file.encrypted_file_path = path.resolve(WEBSEED_FOLDER, file.encrypted_name)

      const writeFileStream = file
        .pipe(encryptCipher)
        .pipe(fs.createWriteStream(file.encrypted_file_path))

      const writeFilePromise = fsStreamPromise(writeFileStream)
      writeFilePromises.push(writeFilePromise)
    } catch (e) {
      log('e', e)
      ctx.throw(500, new Error('Problem encrypting or writing file'))
    }
  }

  try {
    await Promise.all(writeFilePromises)
    ctx.status = 200
  } catch (e) {
    log('e', e)
    ctx.throw(500, 'Cannot write encrypted file to folder')
  }
  await next()
}

async function generateTorrent (ctx, next) {

}

async function saveModel (ctx, next) {

}

async function updateComplete (ctx, next) {

}
