const mongoose = require('mongoose')
const Schema = mongoose.Schema

const folderSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Folder'
  }
})

const Folder = mongoose.model('Folder', folderSchema)

module.exports = Folder
