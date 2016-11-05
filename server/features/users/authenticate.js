const sign = require('koa-jsonwebtoken').sign
const secret = require('../../middleware/authentication').secret
const User = require('./model')
const log = require('../../modules/logger')('arxivum:users:authenticate')

async function authenticate (ctx) {
  const email = ctx.request.body.email
  const password = ctx.request.body.password
  const user = await User.findOne({email})
    .select('email password admin')

  try {
    if (await user.checkPassword(password)) {
      const token = {
        id: user._id,
        email: user.email,
        admin: user.admin
      }
      ctx.body = sign(token, secret, { expiresIn: '7d' })
    } else {
      throw new Error('IncorrectPassword')
    }
  } catch (e) {
    if (e.message === 'IncorrectPassword') {
      ctx.throw(401, 'Incorrect password')
    }
    log(e)
    throw new Error()
  }
}

module.exports = authenticate
