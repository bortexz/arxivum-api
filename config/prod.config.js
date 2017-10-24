const env = process.env

const config = {
  // Main url for the application. If the others are not specified,
  // This one will be taken adding prefixes (/tracker, /api,...) no prefix is
  // front end app
  PUBLIC_URL: env.PUBLIC_URL,

  // Database options
  DATABASE_URL: env.DATABASE_URL,

  // Initial admin email for the database.
  ADMIN_EMAIL: env.ADMIN_EMAIL,
  ADMIN_PASSWORD: env.ADMIN_PASSWORD,

  // Security options
  // JWT_SECRET: process.env.JWT_SECRET || 's0m3th1nG_R4nd0M' + Math.round(Math.random() * 100),
  JWT_SECRET: env.JWT_SECRET,

  // Webseed path (Maybe upload to webseed directly ?) for the api
  WEBSEED_FOLDER: env.WEBSEED_FOLDER,

  // Webseed path for the webseed itself
  WEBSEED_ROOT: env.WEBSEED_ROOT || './files',

  // Public url where to access this api
  // Public url where to access this api
  PUBLIC_API_URL: env.PUBLIC_API_URL,

  // Where the tracker is (WebSocket tracker)
  PUBLIC_TRACKER_URL: env.PUBLIC_TRACKER_URL,

  // Where the webseed is
  PUBLIC_WEBSEED_URL: env.PUBLIC_WEBSEED_URL,

  // Nodemailer options
  // For now only this ones are supported
  // https://nodemailer.com/smtp/well-known/
  // EMAILER_SMTP_SERVICE: env.EMAILER_SMTP_SERVICE,
  EMAILER_PORT: env.EMAILER_PORT,
  EMAILER_HOST: env.EMAILER_HOST,
  EMAILER_PUBLIC_EMAIL: env.EMAILER_PUBLIC_EMAIL,
  EMAILER_AUTH_USER: env.EMAILER_AUTH_USER,
  EMAILER_AUTH_PASSWORD: env.EMAILER_AUTH_PASSWORD,

  // Private PORTS
  API_PORT: env.API_PORT || 3000,
  TRACKER_PORT: env.TRACKER_PORT || 4000,
  WEBSEED_PORT: env.WEBSEED_PORT || 5000
}

module.exports = config

