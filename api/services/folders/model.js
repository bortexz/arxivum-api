const mongoose = require('mongoose')
const Schema = mongoose.Schema
const tree = require('mongoose-path-tree')

const folderSchema = new Schema({
  name: {
    type: String,
    required: true
  }
})

folderSchema.plugin(tree)

const Folder = mongoose.model('Folder', folderSchema)

module.exports = Folder
