const User = require('./model')
const log = require('../../modules/logger')('arxivum:users:middleware')

module.exports = {
  // Main endpoint functions
  createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  // Other useful middlewares
  isAdmin,
  isSameUserOrAdmin
}

// Screen to use when returning results
const USER_SCREEN = 'name email created_at updated_at admin'

async function createUser (ctx) {
  const body = ctx.request.body
  if (body.admin) delete ctx.body.admin
  const newUser = new User(body)
  try {
    const userSaved = await newUser.save()
    ctx.body = userSaved
  } catch (e) {
    if (e.code === 11000) {
      ctx.throw(400, 'This user already exists')
    }
    log.error(e)
    throw new Error()
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
    if (e.message === 'CannotRemoveAdminUser') ctx.throw(400, 'Cannot remove admin user')
    log(e)
    throw new Error()
  }
}

async function isAdmin (ctx, next) {
  if (ctx.state.user.admin) await next()
  else ctx.throw(401, 'You need to be admin to view this resource')
}


async function isSameUserOrAdmin (ctx, next) {
  if (ctx.state.user.admin || (ctx.state.user.id === ctx.request.params.id)) await next()
  else ctx.throw(401, 'You cannot access this resource')
}

