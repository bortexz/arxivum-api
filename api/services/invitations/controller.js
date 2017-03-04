const Invitation = require('./model')

module.exports = {
  fulfillInvitation,
  getInvitation
}

async function fulfillInvitation (_id) {
  return await Invitation.update({ _id }, { $set: { fulfilled: true } })
}

async function getInvitation (email, fulfilled = false) {
  return await Invitation.findOne({ email, fulfilled })
}
