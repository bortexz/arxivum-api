const mongoose = require('mongoose')
const Schema = mongoose.Schema
const tree = require('mongoose-path-tree')

const folderSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: String
})

folderSchema.methods.getPath = getPath
folderSchema.plugin(tree)

const Folder = mongoose.model('Folder', folderSchema)

module.exports = Folder

function getPath () {
  // this === folder I am -> Populate all the way? Will I have it populated already?
  // Do tests. Do navigate in tree for admin in FE, can test this better when I Will
  // be able to create trees.
}
