const path = require('path')

const config = {
  // Main url for the application. If the others are not specified,
  // This one will be taken adding prefixes (/tracker, /api,...) no prefix is
  // front end app
  PUBLIC_URL: 'localhost:4200',

  // Database options
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost/arxivum-dev',

  // Initial admin email for the database.
  ADMIN_EMAIL: 'admin@admin',
  ADMIN_PASSWORD: 'admin',

  // Security options
  // JWT_SECRET: process.env.JWT_SECRET || 's0m3th1nG_R4nd0M' + Math.round(Math.random() * 100),
  JWT_SECRET: 's0m3th1nG_R4nd0M',

  // Webseed options (Maybe upload to webseed directly ?)
  WEBSEED_FOLDER: path.resolve(__dirname, '../files'),

  // Public url where to access this api
  // Public url where to access this api
  PUBLIC_API_URL: 'http://localhost:3000/',

  // Where the tracker is (WebSocket tracker)
  PUBLIC_TRACKER_URL: 'ws://localhost:4000/',

  // Where the webseed is
  PUBLIC_WEBSEED_URL: 'http://localhost:5000/',

  // Nodemailer options
  // For now only this ones are supported
  // https://nodemailer.com/smtp/well-known/
  // EMAILER_SMTP_SERVICE: 'test',
  EMAILER_PORT: 587,
  EMAILER_HOST: 'smtp.upc.edu',
  EMAILER_PUBLIC_EMAIL: 'alberto.fernandez.cubero@est.fib.upc.edu',
  EMAILER_AUTH_USER: 'alberto.fernandez.cubero',
  EMAILER_AUTH_PASSWORD: 'otrebla19914032',

  // Private PORTS
  API_PORT: 3000,
  TRACKER_PORT: 4000,
  WEBSEED_PORT: 5000
}

module.exports = config
