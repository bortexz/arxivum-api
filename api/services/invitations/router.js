const KoaRouter = require('koa-router')
const invitationsRouter = new KoaRouter()
const {
  getAllInvitations,
  createInvitation,
  resendInvitation,
  deleteInvitation
  // getInvitationByToken
} = require('./middleware')
const {
  isAdmin
} = require('../../middleware/authorization')

const {
  isAuthenticated
} = require('../../middleware/authentication')

invitationsRouter.get('/', isAuthenticated, isAdmin, getAllInvitations)
invitationsRouter.post('/', isAuthenticated, isAdmin, createInvitation)
invitationsRouter.get('/:id/resend', isAuthenticated, isAdmin, resendInvitation)
invitationsRouter.del('/:id', isAuthenticated, isAdmin, deleteInvitation)
// invitationsRouter.get('/with-token/', getInvitationByToken)

module.exports = invitationsRouter
