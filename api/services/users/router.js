const KoaRouter = require('koa-router')
const usersRouter = new KoaRouter()
const {
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  createUser,
  grantAccess
} = require('./middleware')

const {
  isSameUserOrAdmin,
  isAdmin
} = require('../../middleware/authorization.js')

usersRouter.get('/', isAdmin, getUsers) // needs admin
usersRouter.get('/:id', isSameUserOrAdmin, getUser) // needs admin or same user

// Needs to have invitation type register for same email, and invite token?
// For now, only isAdmin can create users
usersRouter.post('/', isAdmin, createUser)
usersRouter.post('/grant_access', isAdmin, grantAccess)
usersRouter.del('/:id', isAdmin, deleteUser)
usersRouter.put('/:id', isSameUserOrAdmin, updateUser)

module.exports = usersRouter

