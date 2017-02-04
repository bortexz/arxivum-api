/**
 * Module to send emails
 */
const nodemailer = require('nodemailer')
const config = require('../config')
const debug = require('arxivum:api:emailer')

module.exports = {
  sendInvitationRegisterEmail
}

const transporter = nodemailer.createTransport({
  service: config.EMAILER_SMTP_SERVICE,
  auth: {
    user: config.EMAILER_AUTH_USER,
    pass: config.EMAILER_AUTH_PASSWORD
  }
})

/**
 * opts has the following properties:
 * - email: Who to send the email
 * - name: the name that will be displayed as the sender
 * - token: the token to use in the url
 * - url: the url where to access the app
 */
async function sendInvitationRegisterEmail (opts) {
  let mailOptions = {
    from: config.EMAILER_PUBLIC_EMAIL, // sender address
    to: opts.email, // list of receivers
    subject: `${opts.name} has invited you to it's Arxivum!`, // Subject line
    html: `${opts.url} + ${opts.token}` // html body
  }

  if (global.ENV === 'dev') {
    return debug('Development mode -> Email not sent', mailOptions)
  }
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return debug('Error sending email', error)
    }
    debug('Message %s sent: %s', info.messageId, info.response)
  })
}
