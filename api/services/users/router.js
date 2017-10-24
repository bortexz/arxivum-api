const KoaRouter = require('koa-router')
const usersRouter = new KoaRouter()
const {
  getUsers,
  getUser,
  deleteUser,
  updateUser,
  createUserFactory,
  changePassword
} = require('./middleware')

const {
  isSameUserOrAdmin,
  isAdmin
} = require('../../middleware/authorization.js')

const {
  isAuthenticated
} = require('../../middleware/authentication.js')

usersRouter.get('/', isAuthenticated, isAdmin, getUsers)
usersRouter.get('/:id', isAuthenticated, isSameUserOrAdmin, getUser)

usersRouter.post('/register', createUserFactory(true))

usersRouter.post('/', isAuthenticated, isAdmin, createUserFactory(false))

usersRouter.put('/password', isAuthenticated, changePassword)
usersRouter.del('/:id', isAuthenticated, isAdmin, deleteUser)
usersRouter.put('/:id', isAuthenticated, isSameUserOrAdmin, updateUser)

module.exports = usersRouter

