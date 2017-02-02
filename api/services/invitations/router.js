const KoaRouter = require('koa-router')
const invitationsRouter = new KoaRouter()
const {
  getAllInvitations,
  createInvitation,
  getInvitationByToken
} = require('./middleware')
const {
  isAdmin
} = require('../../middleware/authentication')

invitationsRouter.get('/', isAdmin, getAllInvitations) // needs admin
invitationsRouter.post('/', isAdmin, createInvitation)
invitationsRouter.get('/with-token/', getInvitationByToken)

module.exports = invitationsRouter
