const debug = require('debug')

// If tomorrow logging needs to be changed...
module.exports = function (namespace) {
  const logger = debug(namespace)
  return logger
}
