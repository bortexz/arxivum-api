const path = require('path')

module.exports = process.env.CONFIG_FILE
? require(path.join([process.cwd(), process.env.CONFIG_FILE]))
: require(`./${global.ENV}.config.js`)
