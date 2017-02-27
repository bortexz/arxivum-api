const debug = require('debug')

module.exports = function (namespace) {
  const logger = debug(namespace)
  return logger
}
