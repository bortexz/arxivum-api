// const debug = require('debug')('arxivum:errorHandler')
module.exports = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.body = {
      message: err.message ? err.message : 'Internal error'
    }
    ctx.status = err.status || 500
  }
}
