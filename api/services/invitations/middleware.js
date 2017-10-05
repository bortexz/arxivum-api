const E = require('./errors')
const controller = require('./controller')

module.exports = {
  createInvitation,
  getInvitationByToken,
  getAllInvitations,
  resendInvitation,
  deleteInvitation
}

const createInvitationErrorCodes = {
  [E.INCORRECT_DATA]: 400,
  [E.INVITATION_ALREADY_EXISTS]: 400,
  [E.INVITATION_NOT_FOUND]: 404
}

async function createInvitation (ctx, next) {
  const body = ctx.request.body
  try {
    const newInvitation = await controller.createInvitation(body.email)
    ctx.body = newInvitation
  } catch (e) {
    ctx.throw(createInvitationErrorCodes[e.name] || 500, e.name)
  }
}

async function getInvitationByToken (ctx, next) {
  const token = ctx.request.query.token
  let invitation
  try {
    invitation = await controller.getInvitationByToken(token)
  } catch (e) {
    ctx.throw(createInvitationErrorCodes[e.name] || 500, e.name)
  }
  ctx.body = invitation
}

async function getAllInvitations (ctx, next) {
  try {
    const fulfilled = ctx.request.query.fulfilled
    const invitations = await controller.getAllInvitations(fulfilled)
    ctx.body = invitations
  } catch (err) {
    ctx.throw(500, 'Error occurred while accessing database')
  }
}

async function resendInvitation (ctx, next) {
  const invId = ctx.params.id
  await controller.resendInvitation(invId)
  ctx.status = 200
}

async function deleteInvitation (ctx, next) {
  const invId = ctx.params.id
  try {
    await controller.deleteInvitation(invId)
    ctx.status = 200
  } catch (e) {
    if (e.name === E.INVITATION_NOT_FOUND) ctx.throw(404, 'Not found')
  }
}
