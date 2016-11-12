const sign = require('koa-jsonwebtoken').sign
const secret = require('../../middleware/authentication').secret
const User = require('./model')
const log = require('../../modules/logger')('arxivum:users:authenticate')

async function authenticate (ctx) {
  const {email, password} = ctx.request.body

  try {
    const user = await User.findOne({email})
      .select('email password admin')
    if (!user) {
      throw new Error('UserDoesNotExist')
    }
    if (await user.checkPassword(password)) {
      const token = {
        id: user._id,
        email: user.email,
        admin: user.admin
      }
      ctx.body = {
        token: sign(token, secret, { expiresIn: '7d' }),
        user_id: user._id
      }
    } else {
      throw new Error('IncorrectPassword')
    }
  } catch (e) {
    if (e.message === 'IncorrectPassword') {
      ctx.throw(401, 'Incorrect credentials')
    }
    if (e.message === 'UserDoesNotExist') {
      ctx.throw(401, 'Incorrect credentials')
    }
    log(e)
    throw new Error()
  }
}

module.exports = authenticate
