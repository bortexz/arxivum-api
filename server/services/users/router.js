const KoaRouter = require('koa-router')
const usersRouter = new KoaRouter()
const userMiddleware = require('./middleware')

usersRouter.get('/', userMiddleware.isAdmin, userMiddleware.getUsers) // needs admin
usersRouter.get('/:id', userMiddleware.isSameUserOrAdmin, userMiddleware.getUser) // needs admin or same user
usersRouter.post('/', userMiddleware.createUser) // Needs to have invitation type register for same email, and invite token?
usersRouter.del('/:id', userMiddleware.isAdmin, userMiddleware.deleteUser)
usersRouter.put('/:id', userMiddleware.isSameUserOrAdmin, userMiddleware.updateUser)

module.exports = usersRouter

