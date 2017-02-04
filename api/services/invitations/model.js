const mongoose = require('mongoose')
const Schema = mongoose.Schema
const uuid = require('uuid')

const invitationSchema = new Schema({
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

const Invitation = mongoose.model('Invitation', invitationSchema)

module.exports = Invitation

