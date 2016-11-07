const log = require('./logger')('arxivum:database')
const mongoose = require('mongoose')
mongoose.Promise = Promise
const {DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD} = require('../config')

mongoose.connect(DATABASE_URL)

// Search for admin, if not, create it
const User = require('../features/users/model')

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

mongoose.connection.on('connected', async () => {
  log('Connected to database')
  await createAdminIfNeeded()
})
