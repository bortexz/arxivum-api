const User = require('./model')
const log = require('../../modules/logger')('arxivum:users:middleware')
const pick = require('lodash.pick')
const Invitation = require('../invitations/model')

module.exports = {
  // Main endpoint functions
  createUserFactory,
  getUser,
  getUsers,
  updateUser,
  deleteUser
}

// Screen to use when returning results
const USER_SCREEN = '_id name email created_at updated_at admin'

function createUserFactory (isRegister) {
  return async function (ctx) {
    const body = ctx.request.body
    if (body.admin) delete body.admin

    let {name, email, token, password} = ctx.request.body
    // check it has auth

    let invitation
    if (isRegister) {
      invitation = await Invitation.findOne({ email, token, fulfilled: false })
      if (!invitation) return ctx.throw(401, 'You dont have an invitation to join')
    }

    const newUser = new User({name, email, password})
    try {
      const userSaved = await newUser.save()
      if (isRegister) {
        invitation.fulfilled = true
        await invitation.save()
      }
      ctx.body = pick(userSaved, USER_SCREEN.split(' '))

      // Send registration email ?
    } catch (e) {
      if (e.code === 11000) {
        ctx.throw(400, 'This user already exists')
      }
      log.error(e)
      throw new Error()
    }
  }
}

async function getUser (ctx) {
  try {
    const user = await User
      .findOne({_id: ctx.params.id})
      .select(USER_SCREEN)

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
    const users = await User
      .find()
      .select(USER_SCREEN)
    ctx.body = users
  } catch (e) {
    log(e)
    throw new Error()
  }
}

async function updateUser (ctx) {
  // Only name and password can be updated for now
  const {name, password} = ctx.request.body
  try {
    const modifiedUser = await User
      .findOneAndUpdate({_id: ctx.state.user.id},
        {name, password},
        {fields: USER_SCREEN, new: true})
    ctx.body = modifiedUser
  } catch (e) {
    log(e)
    throw new Error()
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
