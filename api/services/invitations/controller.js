const Invitation = require('./model')
const emailer = require('../../modules/emailer')
const config = require('../../../config')
const E = require('./errors')

// New version!
module.exports = {
  createInvitation,
  getInvitationByToken,
  getAllInvitations,
  resendInvitation,
  getInvitationByEmail,
  fulfillInvitation,
  deleteInvitation
}

async function fulfillInvitation (_id) {
  return await Invitation.update({ _id }, { $set: { fulfilled: true } })
}

function sendInvitationEmail (invitation) {
  emailer.sendInvitationRegisterEmail({
    email: invitation.email,
    token: invitation.token,
    name: config.ADMIN_EMAIL, // read from user?
    url: config.PUBLIC_URL
  })
}

async function createInvitation (email) {
  const newInvitation = new Invitation({ email })
  let savedInvitation
  try {
    savedInvitation = await newInvitation.save()

    // Send email
    sendInvitationEmail(savedInvitation)
  } catch (e) {
    if (e.code === 11000) {
      throw new Error(E.INVITATION_ALREADY_EXISTS)
    }
    if (e.name === 'ValidationError') {
      throw new Error(E.INCORRECT_DATA)
    }
    throw new Error()
  }
  return savedInvitation
}

async function getInvitationByToken (token) {
  const invitation = await Invitation.findOne({ token, fulfilled: false })
  if (!invitation) throw new Error(E.INVITATION_NOT_FOUND)
  return invitation
}

async function getInvitationByEmail (email, fulfilled = false) {
  const invitation = await Invitation.findOne({ email, fulfilled })
  if (!invitation) throw new Error(E.INVITATION_NOT_FOUND)
  return invitation
}

async function getAllInvitations (fulfilled) {
  let invitations
  try {
    if (fulfilled !== undefined) {
      invitations = await Invitation.find({ fulfilled })
    } else {
      invitations = await Invitation.find()
    }
  } catch (err) {
    throw err
  }
  return invitations
}

async function resendInvitation (id) {
  const invitation = await Invitation.findOne({ _id: id, fulfilled: false })
  sendInvitationEmail(invitation)
}

async function deleteInvitation (id) {
  const invitation = await Invitation.findOne({ _id: id })
  if (invitation) {
    invitation.remove()
  } else {
    throw new Error(E.INVITATION_NOT_FOUND)
  }
}
