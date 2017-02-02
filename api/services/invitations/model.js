const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uuid = require('uuid')

const fileSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  token: {
    type: String,
    default: uuid,
    unique: true
  },
  fulfilled: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

const Invitation = mongoose.model('Invitation', fileSchema)

module.exports = Invitation

