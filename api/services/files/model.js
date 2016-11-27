const mongoose = require('mongoose')
const Schema = mongoose.Schema

const fileSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  torrent: {
    type: Buffer,
    required: true
  },
  description: String,
  folder: {
    type: Schema.Types.ObjectId,
    ref: 'Folder'
  },
  created: {
    type: Date,
    default: Date.now
  },
  encrypted_name: {
    type: String,
    required: true
  },
  encryption_key: {
    type: Buffer,
    required: true
  }
})

const File = mongoose.model('File', fileSchema)

module.exports = File

