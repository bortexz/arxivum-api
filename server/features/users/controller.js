const User = require('./model')
const log = require('../../modules/logger')('arxivum:users:controller')

module.exports = {
  createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser
}

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
      .find({_id: ctx.params.id})
      .select('email created_at updated_at admin')

    if (user.length === 0) {
      throw new Error('UserNotFound')
    }

    ctx.body = user[0]
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
      .select('email created_at updated_at admin')
    ctx.body = users
  } catch (e) {
    log(e)
    throw new Error()
  }
}

async function updateUser (ctx) {

}

async function deleteUser (ctx) {

}
