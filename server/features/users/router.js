const KoaRouter = require('koa-router')
const usersRouter = new KoaRouter()
const userController = require('./controller')

usersRouter.get('/', userController.isAdmin, userController.getUsers) // needs admin
usersRouter.get('/:id', userController.isSameUserOrAdmin, userController.getUser) // needs admin or same user
usersRouter.post('/', userController.createUser) // Needs to have invitation type register for same email, and invite token?
usersRouter.del('/:id', userController.isAdmin, userController.deleteUser)
usersRouter.put('/:id', userController.isSameUserOrAdmin, userController.updateUser)

module.exports = usersRouter

