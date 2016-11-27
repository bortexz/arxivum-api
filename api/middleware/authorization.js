module.exports = {
  isAdmin,
  isSameUserOrAdmin
}

async function isAdmin (ctx, next) {
  if (ctx.state.user.admin) await next()
  else ctx.throw(401, 'You need to be admin to view this resource')
}

async function isSameUserOrAdmin (ctx, next) {
  if (ctx.state.user.admin || (ctx.state.user.id === ctx.request.params.id)) {
    await next()
  } else {
    ctx.throw(401, 'You cannot access this resource')
  }
}
