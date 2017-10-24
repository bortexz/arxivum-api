const log = require('./logger')('arxivum:database')
const mongoose = require('mongoose')
mongoose.Promise = Promise
const {DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD} = require('../../config')

// CREATE ADMIN IF NOT EXIST
const User = require('../services/users/model')

async function createAdminIfNeeded () {
  const users = await User.find({admin: true})
  if (users.length === 0) {
    // create admin
    const admin = new User({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      admin: 'true'
    })
    try {
      await admin.save()
      log('Admin created succesfully')
    } catch (e) {
      log('Error when creating the admin user', e)
      process.exit(1)
    }
  }
}

async function connect () {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, async (err) => {
      if (err) reject(err)
      else {
        log('Connected to database')
        await createAdminIfNeeded()
        resolve()
      }
    })
  })
}

module.exports = {
  connect
}
