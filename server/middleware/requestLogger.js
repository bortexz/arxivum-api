const log = require('../modules/logger')('arxivum:log')

module.exports = async (ctx, next) => {
  const timestamp = new Date().getTime()
  let message = `REQUEST:: url: ${ctx.request.url} - method: ${ctx.request.method} `
  try {
    await next()
  } finally {
    message += `RESPONSE:: status: ${ctx.response.status} `
    if (ctx.status >= 400 && ctx.status <= 500) message += `error: ${ctx.body.message} `
    message += `TIME:: ${new Date().getTime() - timestamp}ms`
    log(message)
  }
}
