const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const SALT_FACTOR = 10

const userSchema = new Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  admin: {
    type: Boolean,
    default: false
  },
  created_at: Date,
  updated_at: Date
})

userSchema.pre('save', updatePasswordIfDifferent)
userSchema.pre('save', updateUpdated)

userSchema.methods.checkPassword = checkPassword

const User = mongoose.model('User', userSchema)

module.exports = User

function updateUpdated (next) {
  var currentDate = new Date()

  this.updated_at = currentDate

  if (!this.created_at) {
    this.created_at = currentDate
  }

  next()
}

function updatePasswordIfDifferent (next) {
  var user = this

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
    if (err) return next(err)

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err)

      user.password = hash
      next()
    })
  })
}

function checkPassword (password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, function (err, isMatch) {
      if (err) reject(err)
      resolve(isMatch)
    })
  })
}
