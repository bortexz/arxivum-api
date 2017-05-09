const fs = require('mz/fs')
const path = require('path')
const uuid = require('uuid')
const qcrypto = require('crypto-promise')
const crypto = require('crypto')
const R = require('ramda')
const streamToPromise = require('stream-to-promise')
const urljoin = require('url-join')

const File = require('./model')
const log = require('../../modules/logger')('arxivum:files:controller')
const {
  WEBSEED_FOLDER,
  PUBLIC_API_URL,
  PUBLIC_TRACKER_URL
} = require('../../config')
const { createTorrentPromise } = require('./utils')
const E = require('./errors')

module.exports = {
  getFile,
  getFiles,
  updateFile,
  deleteFiles,
  uploadFiles
}

const ENCRYPT_ALGO = 'aes-256-cbc'

async function getFile (_id, fields = '_id name size torrent encryption_key') {
  return await File.findOne({ _id }).select(fields)
}

async function getFiles (folderId, fields = '_id name size torrent') {
  const files = await File
    .find({folder: folderId})
    .select(fields)
  return files
}

async function updateFile (id, { name }) {
  return await File.findOneAndUpdate({
    _id: id
  }, { name })
}

async function deleteFiles (query) {
  const files = await File
      .find(query)

  if (files === []) {
    throw new Error(E.FILE_NOT_FOUND_ERROR(query))
  }

  await Promise.all(
    R.map(
      async file => {
        await fs.unlink(path.resolve(WEBSEED_FOLDER, file.encrypted_name))
        await file.remove()
      }, files)
  )
}
/**
 * Upload files
 */

const assign = R.flip(R.merge) // Data last version of merge.

async function uploadFiles (files, folder) {
  return await Promise.all(
    R.map(async file => {
      /** Generate crypto properties */
      const uuidName = `${uuid()}.enc`
      let encryptKey
      try {
        encryptKey = await qcrypto.randomBytes(256)
      } catch (err) {
        throw new Error(E.GENERATE_CRYPTO_KEY_ERROR)
      }

      /** File model */
      let model = {
        encrypted_name: uuidName,
        encryption_key: encryptKey,
        encrypted_file_path: path.resolve(WEBSEED_FOLDER, uuidName),
        file
      }

      /** encrypt and save to filesystem */
      const encryptCipher =
        crypto.createCipher(ENCRYPT_ALGO, model.encryption_key)

      const writeFileStream = model.file
        .pipe(encryptCipher)
        .pipe(fs.createWriteStream(model.encrypted_file_path))

      try {
        await streamToPromise(writeFileStream)
      } catch (err) {
        log(err)
        throw new Error(E.ENCRYPTION_ERROR(model.file.filename))
      }

      /** Generate torrent file */
      const downloadUrl =
        urljoin(PUBLIC_API_URL, 'webseed', model.encrypted_name)

      const trackerUrl = urljoin(PUBLIC_TRACKER_URL, 'tracker', 'announce')

      const torrentOpts = {
        name: model.file.filename,
        // createdBy: process.env.AUTHOR,
        creationDate: Date.now(),
        private: true,
        announceList: [[trackerUrl]],
        urlList: downloadUrl
      }

      try {
        const torrent =
          await createTorrentPromise(model.encrypted_file_path, torrentOpts)

        model = assign({ torrent }, model)
      } catch (e) {
        log(e)
        throw new Error(E.GENERATE_TORRENT_ERROR(model.file.filename))
      }

      /** Save model into DB */
      const fileToSave = new File({
        name: model.file.filename,
        size: model.file.bytesRead,
        torrent: model.torrent,
        folder,
        encryption_key: model.encryption_key,
        encrypted_name: model.encrypted_name
      })

      try {
        return await fileToSave.save()
      } catch (e) {
        log(e)
        throw new Error(E.SAVE_DATABASE_ERROR(model.file.filename))
      }
    }, files)
  )
}
