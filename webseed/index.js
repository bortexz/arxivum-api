const webseed = require('./webseed')
const http = require('http')
const config = require('../config')
const debug = require('debug')('arxivum:webseed')

http.createServer(webseed.callback()).listen(config.WEBSEED_PORT)

debug('Webseed listening on port ' + config.WEBSEED_PORT)
