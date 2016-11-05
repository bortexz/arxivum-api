const log = require('./logger')('arxivum:database')
const mongoose = require('mongoose')
mongoose.Promise = Promise
const dbUrl = process.env.DATABASE_URL || 'mongodb://localhost/arxivum-dev'

const adminEmail = process.env.ADMIN_EMAIL || 'admin'
const adminPassword = process.env.ADMIN_PASSWORD || 'admin'

mongoose.connect(dbUrl)

// Search for admin, if not, create it
const User = require('../features/users/model')

async function createAdminIfNeeded () {
  const users = await User.find({admin: true})
  if (users.length === 0) {
    // create admin
    const admin = new User({
      email: adminEmail,
      password: adminPassword,
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
