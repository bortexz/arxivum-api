const path = require('path')

const config = {
  // Main url for the application. If the others are not specified,
  // This one will be taken adding prefixes (/tracker, /api,...) no prefix is
  // front end app
  PUBLIC_URL: process.env.PUBLIC_URL || 'localhost:4200',

  // Database options
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost/arxivum-dev',

  // Initial admin email for the database. Move to first migration ?
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin',

  // Security options
  // JWT_SECRET: process.env.JWT_SECRET || 's0m3th1nG_R4nd0M' + Math.round(Math.random() * 100),
  JWT_SECRET: process.env.JWT_SECRET || 's0m3th1nG_R4nd0M',

  // Webseed options (Maybe upload to webseed directly ?)
  WEBSEED_FOLDER:
    process.env.WEBSEED_FOLDER || path.resolve(__dirname, '../../files'),

  // Public url where to access this api
  PUBLIC_API_URL: process.env.PUBLIC_API_URL ||
    process.env.PUBLIC_URL
      ? path.join(process.env.PUBLIC_URL, 'api')
      : 'http://localhost:2000/',

  // Where the tracker is
  PUBLIC_TRACKER_URL: process.env.PUBLIC_TRACKER_URL || 'ws://localhost:2000',

  // Nodemailer options
  // For now only this ones are supported
  // https://nodemailer.com/smtp/well-known/
  EMAILER_SMTP_SERVICE: process.env.EMAILER_SMTP_SERVICE,
  EMAILER_PUBLIC_EMAIL: process.env.EMAILER_PUBLIC_USER,
  EMAILER_AUTH_USER: process.env.EMAILER_AUTH_EMAIL,
  EMAILER_AUTH_PASSWORD: process.env.EMAILER_AUTH_PASSWORD
}

module.exports = config
