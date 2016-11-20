// const File = require('./model')
const asyncBusboy = require('async-busboy')
const path = require('path')
const fs = require('fs')
const qcrypto = require('crypto-promise')
const crypto = require('crypto')
const log = require('../../modules/logger')('arxivum:files:middleware')
const uuid = require('uuid')
const {fsStreamPromise, createTorrentPromise} = require('./utils')
const {WEBSEED_FOLDER, PUBLIC_URL} = require('../../config')
const urljoin = require('url-join')

const ENCRYPT_ALGO = 'aes-256-cbc'

module.exports = {
  getFile,
  getFiles,
  deleteFile,
  // Update specific
  loadFiles,
  encryptAndStore,
  generateTorrents,
  saveModels,
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

/**
 * It parses the upload of the files, and store the
 * files inside ctx.files
 */
async function loadFiles (ctx, next) {
  const {files} = await asyncBusboy(ctx.req)
  ctx.files = files
  await next()
}

/**
 * Takes the files in ctx.files, and for each one
 * encrypts the file and saves in storage the encrypted
 * version.
 */
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
  } catch (e) {
    log('e', e)
    ctx.throw(500, 'Cannot write encrypted file to folder')
  }
  await next()
}
/**
 * Takes context.files and generates a torrent object
 * for each of them. Stored as a buffer under files[].torrent
 */
async function generateTorrents (ctx, next) {
  for (let file of ctx.files) {
    const downloadUrl = urljoin(PUBLIC_URL, 'webseed', file.encrypted_name)
    const trackerUrl = urljoin(PUBLIC_URL, 'tracker')
    const opts = {
      name: file.filename,
      // createdBy: process.env.AUTHOR,
      creationDate: Date.now(),
      private: true,
      announceList: [[trackerUrl]],
      urlList: downloadUrl
    }

    try {
      file.torrent = await createTorrentPromise(file.encrypted_file_path, opts)
    } catch (e) {
      log(e)
      ctx.throw(500, 'Error while generating torrent of file')
    }
  }
  await next()
}

async function saveModels (ctx, next) {

}

async function updateComplete (ctx, next) {

}
