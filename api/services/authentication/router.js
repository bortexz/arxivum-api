const KoaRouter = require('koa-router')
const authenticationRouter = new KoaRouter()
const { authenticate } = require('./middleware')

authenticationRouter.post('/', authenticate)

module.exports = authenticationRouter
