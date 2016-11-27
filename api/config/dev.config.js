const path = require('path')

const config = {
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost/arxivum-dev',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin',
  JWT_SECRET: process.env.JWT_SECRET || 's0m3th1nG_R4nd0M',
  WEBSEED_FOLDER:
    process.env.WEBSEED_FOLDER || path.resolve(__dirname, '../../files'),
  PUBLIC_API_URL: process.env.PUBLIC_URL || 'http://localhost:2000/',
  PUBLIC_TRACKER_URL: process.env.PUBLIC_TRACKER_URL || 'ws://localhost:2000'
}

module.exports = config
