const koaJwt = require('koa-jsonwebtoken')
const jwt = koaJwt.default
const secret = require('../../config').JWT_SECRET

module.exports = {
  isAuthenticated:
    jwt({ secret, extractToken: koaJwt.fromAuthorizationHeader }),
  secret
}
