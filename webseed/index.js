const debug = require('debug')('arxivum:webseed')
const Koa = require('koa')
const koaStatic = require('koa-static')
const koaRouter = require('koa-router')()

const app = new Koa()

koaRouter.use('webseed', koaStatic('../files'))

app.use(koaRouter.routes())

app.listen(5000)

debug('Webseed listening on port 5000')
