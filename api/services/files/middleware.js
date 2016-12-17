const File = require('./model')
const asyncBusboy = require('async-busboy')
const path = require('path')
const fs = require('fs')
const qcrypto = require('crypto-promise')
const crypto = require('crypto')
const log = require('../../modules/logger')('arxivum:files:middleware')
const uuid = require('uuid')
const {fsStreamPromise, createTorrentPromise} = require('./utils')
const {
  WEBSEED_FOLDER,
  PUBLIC_API_URL,
  PUBLIC_TRACKER_URL
} = require('../../config')
const urljoin = require('url-join')
const pick = require('lodash.pick')

const ENCRYPT_ALGO = 'aes-256-cbc'
const FILE_SCREEN = '_id name size torrent description'

module.exports = {
  getFile,
  deleteFile,
  // Update specific
  loadFiles,
  encryptAndStore,
  generateTorrents,
  saveModels,
  completeUpdate,
  // constants
  FILE_SCREEN
}

/**
 * Gets file by id
 */
async function getFile (ctx, next) {
  try {
    const file = await File
      .findOne({_id: ctx.params.id})
      .select(FILE_SCREEN)

    if (file === null) {
      throw new Error('FileNotFound')
    }

    ctx.body = file
  } catch (e) {
    if (e.name === 'CastError') {
      ctx.throw(400, 'Invalid ID')
    }
    if (e.message === 'FileNotFound') {
      ctx.throw(404, 'File not found')
    }
    log(e)
    throw new Error()
  }
}

/**
 * Deletes a file (From DB and filesystem)
 */
async function deleteFile (ctx, next) {
  // Get file, along with encrypted_name
  try {
    const file = await File
      .findOne({_id: ctx.params.id})

    if (file === null) {
      throw new Error('FileNotFound')
    }

    fs.unlink(path.resolve(WEBSEED_FOLDER, file.encrypted_name))
    await file.remove()
    ctx.status = 200
  } catch (e) {
    if (e.name === 'CastError') {
      ctx.throw(400, 'Invalid ID')
    }
    if (e.message === 'FileNotFound') {
      ctx.throw(404, 'File not found')
    }
  }
}

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

      const encryptCipher =
        crypto.createCipher(ENCRYPT_ALGO, file.encryption_key)

      file.encrypted_file_path =
        path.resolve(WEBSEED_FOLDER, file.encrypted_name)

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
    const downloadUrl = urljoin(PUBLIC_API_URL, 'webseed', file.encrypted_name)
    const trackerUrl = urljoin(PUBLIC_TRACKER_URL, 'tracker', 'announce')
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
/**
 * Creates the DB model for the file
 * and saves it.
 */
async function saveModels (ctx, next) {
  for (let file of ctx.files) {
    const fileToSave = new File({
      name: file.filename,
      size: file.bytesRead,
      torrent: file.torrent,
      folder: ctx.query['folder'],
      // description: , TODO : Add description and send it over the upload
      encryption_key: file.encryption_key,
      encrypted_name: file.encrypted_name
    })

    try {
      file.model_saved = await fileToSave.save()
    } catch (e) {
      log(e)
      ctx.throw('Cannot store file model in database')
    }
  }
  await next()
}

/**
 * Generates the body of the response
 */
async function completeUpdate (ctx, next) {
  ctx.body = ctx.files.map(
    file => pick(file.model_saved, FILE_SCREEN.split(' '))
  )
}
