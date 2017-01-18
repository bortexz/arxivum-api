const debug = require('debug')('arxivum:webseed')
const Koa = require('koa')
// const range = require('koa-range')
const range = require('koa-range')
const koaRouter = require('koa-router')()
const cors = require('koa-cors')
const fs = require('fs')
const path = require('path')

const app = new Koa()

app.use(cors()) // TODO : Optional | Dependent of dev/prod

koaRouter.get('/webseed/:file', range, async (ctx, next) => {
  ctx.body = fs.createReadStream(path.join('./files', ctx.params.file))
})

app.use(koaRouter.routes(), koaRouter.allowedMethods())

app.listen(5000)

debug('Webseed listening on port 5000')
