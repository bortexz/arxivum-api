/* eslint-env mocha */
// const supertest = require('supertest')
const expect = require('chai').expect
const utils = require('./utils')
const req = require('supertest')
const killable = require('killable')
const http = require('http')

describe('Authentication and authorization tests', function () {
  let server
  before(async function () {
    this.timeout(5000)
    utils.configTest()
    await utils.dropDB()
    utils.configDB()

    const app = require('../api/app')
    const db = require('../api/modules/database')
    await db.connect()

    server = http.createServer(app.callback()).listen(process.env.API_PORT)
    server = killable(server)
    // Let server create the admin user and password
    await utils.tick(1500)
  })

  after(done => {
    server.kill(() => {
      utils.disconnectDb()
      done()
    })
  })

  it('When initialized, I can directly authenticate with admin user', async () => {
    const res = await req(server)
      .post('/api/authenticate')
      .send({ email: 'admin@admin', password: 'admin' })

    expect(res.status).to.equals(200)
    expect(res.body).to.have.property('token')
    expect(res.body).to.have.property('admin', true)
  })

  it('With the token, I can access protected routes', async () => {
    const token = await utils.authenticate(server, 'admin@admin', 'admin')

    const res = await req(server)
      .get('/api/folders')
      .set('Authorization', 'Bearer ' + token)

    expect(res.status).to.equals(200)
  })

  it('Without the token, a 401 error is sent', async () => {
    const res = await req(server)
      .get('/api/folders')

    expect(res.status).to.equals(401)
  })

  it('Sends 401 when accessing an admin root from non-admin user', async () => {
    await utils.createUser(server, { email: 'test@test', password: 'test' })

    const userToken = await utils.authenticate(server, 'test@test', 'test')
    const res = await req(server)
      .get('/api/users') // Root protected only for admin
      .set('Authorization', 'Bearer ' + userToken)

    expect(res.status).to.equals(401)
  })
})
