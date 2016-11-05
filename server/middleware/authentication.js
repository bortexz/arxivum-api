const koaJwt = require('koa-jsonwebtoken')
const jwt = koaJwt.default
const secret = process.env.JWT_SECRET || 's0m3th1nG_R4nd0M'

module.exports = {
  isAuthenticated: jwt({ secret, extractToken: koaJwt.fromAuthorizationHeader }),
  secret
}
