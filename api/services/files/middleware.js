const asyncBusboy = require('async-busboy')
const R = require('ramda')

const log = require('../../modules/logger')('arxivum:files:middleware')
const fileController = require('./controller')

const FILE_LIST_SCREEN = '_id name size torrent'
const FILE_SCREEN = '_id name size torrent encryption_key'

const E = require('./errors')

module.exports = {
  getFile,
  deleteFile,
  updateFile,
  uploadFiles,
  FILE_SCREEN,
  FILE_LIST_SCREEN
}

async function updateFile (ctx, next) {
  const id = ctx.params.id
  const data = ctx.request.body
  try {
    ctx.body = fileController.updateFile(id, data)
  } catch (err) {
    ctx.throw(500, 'Cannot update file')
  }
}

/**
 * Gets file by id
 */
async function getFile (ctx, next) {
  try {
    const file = await fileController.getFile(ctx.params.id, FILE_SCREEN)
    if (!file) throw new Error('FileNotFound')
    ctx.body = file
  } catch (e) {
    log(e)
    if (e.name === 'CastError') {
      ctx.throw(400, 'Invalid ID')
    } else if (e.message === 'FileNotFound') {
      ctx.throw(404, E.FILE_NOT_FOUND_ERROR(ctx.params.id))
    } else ctx.throw(500, 'Unknown error')
  }
}

/**
 * Deletes a file (From DB and filesystem)
 */
async function deleteFile (ctx, next) {
  // Get file, along with encrypted_name
  try {
    await fileController.deleteFiles({ _id: ctx.params.id })
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

async function uploadFiles (ctx, next) {
  try {
    const folder = ctx.query['folder']
    const { files } = await asyncBusboy(ctx.req)

    const savedFiles = await fileController.uploadFiles(files, folder)

    ctx.body = savedFiles.map(
      file => R.pick(FILE_SCREEN.split(' '), file),
      savedFiles
    )
  } catch (err) {
    log(err)
    ctx.throw(500, err.name)
  }
}
