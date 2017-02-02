const KoaRouter = require('koa-router')
const invitationsRouter = new KoaRouter()
const userMiddleware = require('./middleware')

invitationsRouter.get('/', userMiddleware.isAdmin, userMiddleware.getUsers) // needs admin
invitationsRouter

module.exports = invitationsRouter
