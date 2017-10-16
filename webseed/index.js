// Environment
global.ENV = process.env.NODE_ENV || 'dev'

const debug = require('debug')('arxivum:webseed')
const Koa = require('koa')
// const range = require('koa-range')
const range = require('koa-range')
const koaRouter = require('koa-router')()
const cors = require('koa-cors')
const fs = require('fs')
const path = require('path')
const { WEBSEED_PORT } = require('../config/')

const app = new Koa()

// app.use(cors({
//   // headers: ['Range', 'range', 'Accept', 'Accept-Encoding', 'Content-Type']
// })) // TODO : Optional | Dependent of dev/prod

app.use(cors())

koaRouter.get('/:file',
async (ctx, next) => {
  ctx.set('Cache-Control', 'no-cache, no-store')
  ctx.set('Pragma', 'no-cache')
  var range = ctx.header.range

  if (!range) {
    console.log('no Range!')
    ctx.status = 416
    return
  }
  await next()
},
range, async (ctx, next) => {
  ctx.body = fs.createReadStream(path.join('./files', ctx.params.file))
})

app.use(koaRouter.routes(), koaRouter.allowedMethods())

app.listen(WEBSEED_PORT)

debug('Webseed listening on port 5000')
