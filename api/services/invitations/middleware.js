const Invitation = require('./model')

module.exports = {
  createInvitation,
  getInvitationByToken,
  getAllInvitations
}

async function createInvitation (ctx, next) {
  const body = ctx.request.body
  const newInvitation = new Invitation(body)
  try {
    const savedInvitation = await newInvitation.save()
    ctx.body = savedInvitation
  } catch (e) {
    if (e.code === 11000) {
      ctx.throw(400, 'This invitation email already exists')
    }
    if (e.name === 'ValidationError') {
      ctx.throw(400, 'Incorrect data')
    }
    throw new Error()
  }
}

async function getInvitationByToken (ctx, next) {
  const token = ctx.request.query.token
  const invitation = await Invitation.find({ token })
  try {
    if (!invitation) throw new Error('Not found')
  } catch (e) {
    if (e.name === 'Not found') ctx.throw(404, 'Not found')
  }
}

async function getAllInvitations (ctx, next) {
  const invitations = await Invitation.find()
  ctx.body = invitations
}
