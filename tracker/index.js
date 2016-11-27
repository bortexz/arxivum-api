const Server = require('bittorrent-tracker').Server
const debug = require('debug')('arxivum:tracker')

const server = new Server({
  udp: true, // enable udp server? [default=true]
  http: true, // enable http server? [default=true]
  ws: true, // enable websocket server? [default=true]
  stats: true, // enable web-based statistics? [default=true]
  filter: function (infoHash, params, cb) {
    // debug('tracker received request!!')
    // var allowed = (infoHash === 'aaa67059ed6bd08362da625b3ae77f6f4a075aaa')
    // cb(allowed)
  }
})

// Lots of console logs for now
server.on('error', function (err) {
  // fatal server error!
  debug(err.message)
})

server.on('warning', function (err) {
  // client sent bad data. probably not a problem, just a buggy client.
  debug(err.message)
})

server.on('listening', function () {
  // fired when all requested servers are listening
  debug('listening on http port:' + server.http.address().port)
})

server.on('start', function (addr) {
  debug('got start message from ' + addr)
})

server.on('complete', function (addr) {
  debug('tracker on Update')
})
server.on('update', function (addr) {
  debug('tracker on Update')
})
server.on('stop', function (addr) {
  debug('tracker on Update')
})

// start tracker server listening! Use 0 to listen on a random free port.
server.listen(4000, 'localhost')
