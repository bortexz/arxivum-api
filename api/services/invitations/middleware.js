const Invitation = require('./model')
const emailer = require('../../modules/emailer')
const config = require('../../config')

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

    // sends email
    emailer.sendInvitationRegisterEmail({
      email: savedInvitation.email,
      token: savedInvitation.token,
      name: 'Someone', // read from user?
      url: config.PUBLIC_URL
    })
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
  const invitation = await Invitation.find({ token, fulfilled: false })
  try {
    if (!invitation) throw new Error('Not found')
  } catch (e) {
    if (e.name === 'Not found') ctx.throw(404, 'Not found')
  }
}

async function getAllInvitations (ctx, next) {
  try {
    const invitations = await Invitation.find()
    ctx.body = invitations
  } catch (err) {
    ctx.throw(500, 'Error occurred while accessing database')
  }
}

async function hasInvitation (ctx, next) {
  let email = ctx.body.email
  let token = ctx.body.token
}
