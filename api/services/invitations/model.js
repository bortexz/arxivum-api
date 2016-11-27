const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uuid = require('uuid')

const fileSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['file-access', 'folder-access', 'register'],
    required: true
  },
  token: {
    type: String,
    default: uuid
  },
  allow_register: {
    type: Boolean,
    required: true,
    default: false
  },
  files: {
    type: Schema.types.ObjectId,
    ref: 'File'
  },
  folders: {
    type: Schema.types.ObjectId,
    ref: 'Folder'
  }
})

const File = mongoose.model('File', fileSchema)

module.exports = File

