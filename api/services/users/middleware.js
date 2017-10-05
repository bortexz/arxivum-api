const User = require('./model')
const log = require('../../modules/logger')('arxivum:users:middleware')
const R = require('ramda')
const userCtrl = require('./controller')
const invitationCtrl = require('../invitations/controller')

module.exports = {
  // Main endpoint functions
  createUserFactory,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  changePassword
}

// Screen to use when returning results
const USER_SCREEN = '_id name email created_at updated_at admin'

function createUserFactory (isRegister) {
  return async function (ctx) {
    let userData = ctx.request.body
    let invitation
    try {
      if (isRegister) {
        invitation = await invitationCtrl.getInvitationByEmail(userData.email, false)
        if (!invitation) return ctx.throw(401, 'You dont have an invitation to join')
      }

      const newUser = await userCtrl.createUser(userData)
      if (isRegister) {
        await invitationCtrl.fulfillInvitation(invitation._id)
      }

      ctx.body = R.pick(USER_SCREEN.split(' '), newUser)
    } catch (e) {
      if (e.code === 11000) {
        ctx.throw(400, 'This user already exists')
      }
      log(e)
      throw new Error()
    }
  }
}

async function getUser (ctx) {
  try {
    const user = userCtrl.getUser(ctx.request.params.id, USER_SCREEN)

    if (user === null) {
      throw new Error('UserNotFound')
    }

    ctx.body = user
  } catch (e) {
    if (e.name === 'CastError') {
      ctx.throw(400, 'Invalid ID')
    }
    if (e.message === 'UserNotFound') {
      ctx.throw(404, 'User not found')
    }
    log(e)
    throw new Error()
  }
}

async function getUsers (ctx) {
  try {
    const users = await userCtrl.getUsers(USER_SCREEN)
    ctx.body = users
  } catch (e) {
    log(e)
    throw new Error()
  }
}

// Not in use, for change password there is another function
async function updateUser (ctx) {
  // Only name and password can be updated for now
  const {name, password} = ctx.request.body
  try {
    const modifiedUser =
      await userCtrl.updateUser(ctx.request.params.id, {name, password}, USER_SCREEN)
    ctx.body = modifiedUser
  } catch (e) {
    log(e)
    ctx.throw(500, new Error())
  }
}

async function deleteUser (ctx) {
  try {
    // Only remove if not admin
    const user = await User.findOne({_id: ctx.request.params.id})
    if (user.admin) throw new Error('CannotRemoveAdminUser')
    await user.remove()
  } catch (e) {
    if (e.message === 'CannotRemoveAdminUser') {
      ctx.throw(400, 'Cannot remove admin user')
    }
    log(e)
    throw new Error()
  }
}

async function changePassword (ctx) {
  const { current_password, new_password } = ctx.request.body
  // get user
  const user = await User.findOne({_id: ctx.state.user.id})
  if (await user.checkPassword(current_password)) {
    user.password = new_password
    await user.save()
    ctx.status = 200
  } else {
    ctx.throw(404, 'Current password not correct')
  }
}
