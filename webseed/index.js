const debug = require('debug')('arxivum:webseed')
const Koa = require('koa')
const koaStatic = require('koa-static')
const koaRouter = require('koa-router')()
const cors = require('koa-cors')

const app = new Koa()

app.use(cors()) // TODO : Optional | Dependent of dev/prod

koaRouter.use('webseed', koaStatic('../files'))

app.use(koaRouter.routes())

app.listen(5000)

debug('Webseed listening on port 5000')
