/* eslint-env mocha */
const expect = require('chai').expect
const utils = require('./utils')
const req = require('supertest')
const killable = require('killable')
const http = require('http')

describe('Invitations API tests', function () {
  let server
  let adminToken
  let userToken

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

    adminToken = await utils.authenticateAdmin(server)

    utils.createUser(server, { email: 'test@test', password: 'test' })
    userToken = await utils.authenticate(server, 'test@test', 'test')
  })

  after(done => {
    server.kill(() => {
      utils.disconnectDb()
      done()
    })
  })

  describe('API', () => {
    let testInvitation
    it('Can create an invitation as an admin', async () => {
      const invRes = await req(server)
        .post('/api/invitations/')
        .send({ email: 'a@a' })
        .set('Authorization', 'Bearer ' + adminToken)

      expect(invRes.status).to.equals(200)
    })

    it('Cannot create an invitation as a user', async () => {
      const invRes = await req(server)
        .post('/api/invitations/')
        .send({ email: 'a@a' })
        .set('Authorization', 'Bearer ' + userToken)

      expect(invRes.status).to.equals(401)
    })

    it('Can get lst of invitations as an admin', async () => {
      const invRes = await req(server)
        .get('/api/invitations/')
        .set('Authorization', 'Bearer ' + adminToken)

      const list = invRes.body
      testInvitation = list[0]
      expect(invRes.status).to.equals(200)
      expect(list).to.be.instanceOf(Array)
      expect(testInvitation).to.have.keys('_id', 'email', 'fulfilled', 'token')
    })

    it('Cannot get list of invitations as a user', async () => {
      const invRes = await req(server)
        .get('/api/invitations/')
        .set('Authorization', 'Bearer ' + userToken)

      expect(invRes.status).to.equals(401)
    })

    it('Cannot delete invitation as a user', async () => {
      const invDel = await req(server)
        .del('/api/invitations/' + testInvitation._id)
        .set('Authorization', 'Bearer ' + userToken)

      expect(invDel.status).to.equals(401)
    })

    it('Can delete invitation as an admin', async () => {
      const invDel = await req(server)
        .del('/api/invitations/' + testInvitation._id)
        .set('Authorization', 'Bearer ' + adminToken)

      expect(invDel.status).to.equals(200)

      const list = await req(server)
        .get('/api/invitations/')
        .set('Authorization', 'Bearer ' + adminToken)

      expect(list.body.length).to.equals(0)
    })
  })
})
