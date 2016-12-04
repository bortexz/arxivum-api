const httpProxy = require('http-proxy')
const http = require('http')

// Import the different servers
require('./api')
require('./tracker')
require('./webseed')

const proxy = httpProxy.createProxyServer({})
const trackerProxy = httpProxy.createProxyServer({
  ws: true,
  target: 'ws://localhost:4000'
})

const server = http.createServer((req, res) => {
  const resource = req.url.split('/')[1]
  if (resource === 'api') {
    proxy.web(req, res, {
      target: 'http://localhost:3000'
    })
  } else if (resource === 'webseed') {
    console.log('before passing to webseed?')
    proxy.web(req, res, {
      target: 'http://localhost:5000'
    })
  }
}).listen(2000)

console.log('server listening on port 2000')

server.on('upgrade', function (req, socket, head) {
  const resource = req.url.split('/')[1]
  if (resource === 'tracker') {
    trackerProxy.ws(req, socket, head)
  }
})
