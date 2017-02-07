const KoaRouter = require('koa-router')
const usersRouter = new KoaRouter()
const {
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  createUserFactory
} = require('./middleware')

const {
  isSameUserOrAdmin,
  isAdmin
} = require('../../middleware/authorization.js')

const {
  isAuthenticated
} = require('../../middleware/authentication.js')

usersRouter.get('/', isAdmin, getUsers)
usersRouter.get('/:id', isSameUserOrAdmin, getUser)

usersRouter.post('/register', createUserFactory(true))

usersRouter.post('/', isAuthenticated, isAdmin, createUserFactory(false))

usersRouter.del('/:id', isAuthenticated, isAdmin, deleteUser)
usersRouter.put('/:id', isSameUserOrAdmin, updateUser)

module.exports = usersRouter

