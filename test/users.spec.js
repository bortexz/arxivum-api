/* eslint-env mocha */
const expect = require('chai').expect
const utils = require('./utils')
const req = require('supertest')
const killable = require('killable')
const http = require('http')

describe('Users API tests', function () {
  let server
  let adminToken
  let userToken
  let userCreated

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

    userCreated = await utils.createUser(server, { email: 'test@test', password: 'test' })
    userToken = await utils.authenticate(server, 'test@test', 'test')
  })

  after(done => {
    server.kill(() => {
      utils.disconnectDb()
      done()
    })
  })

  describe('API', () => {
    it('Can create a user as an admin', async () => {
      const userRes = await req(server)
        .post('/api/users/')
        .send({ email: 'a@a', password: 'a', name: 'a' })
        .set('Authorization', 'Bearer ' + adminToken)

      expect(userRes.status).to.equals(200)
    })

    it('Cannot create a user as a user in post /users/', async () => {
      const userRes = await req(server)
        .post('/api/users/')
        .send({ email: 'b@b', password: 'b', name: 'b' })
        .set('Authorization', 'Bearer ' + userToken)

      expect(userRes.status).to.equals(401)
    })

    it('Can create a user as an anonymous through register with a valid invitation', async () => {
      // Generate valid invitation
      const invRes = await req(server)
        .post('/api/invitations/')
        .send({ email: 'test2@test' })
        .set('Authorization', 'Bearer ' + adminToken)

      const invitation = invRes.body
      const invToken = invitation.token

      const registerRes = await req(server)
        .post('/api/users/register/')
        .send({ email: 'test2@test', password: 'test', token: invToken })

      expect(registerRes.status).to.equals(200)

      const loginToken = await utils.authenticate(server, 'test2@test', 'test')
      expect(loginToken).to.exist
    })

    it('Cannot register with a different email than the one in the invitation', async () => {
      const invRes = await req(server)
        .post('/api/invitations/')
        .send({ email: 'test2@test' })
        .set('Authorization', 'Bearer ' + adminToken)

      const invitation = invRes.body
      const invToken = invitation.token

      const registerRes = await req(server)
        .post('/api/users/register/')
        .send({ email: 'test@test2', password: 'test', token: invToken })

      expect(registerRes.status).to.equals(404)
    })

    it('Cannot create a user without a valid token', async () => {
      const registerRes = await req(server)
        .post('/api/users/register/')
        .send({ email: 'test@test2', password: 'test', token: 'random' })

      expect(registerRes.status).to.equals(404)
    })

    it('Can get the list of users as an admin', async () => {
      const registerRes = await req(server)
        .get('/api/users/')
        .set('Authorization', 'Bearer ' + adminToken)

      expect(registerRes.status).to.equals(200)
      expect(registerRes.body).to.be.instanceof(Array)
      const userKeys = ['_id', 'email', 'admin', 'created_at', 'updated_at']
      expect(registerRes.body[0]).to.have.keys(...userKeys)
    })

    it('Can get a single user as an admin', async () => {
      const registerRes = await req(server)
        .get('/api/users/' + userCreated._id)
        .set('Authorization', 'Bearer ' + adminToken)

      expect(registerRes.status).to.equals(200)
      const userKeys = ['_id', 'email', 'admin', 'created_at', 'updated_at']
      expect(registerRes.body).to.have.keys(...userKeys)
    })

    it('Can get a user having authenticated as that user (personal info)', async () => {
      const newUser = await utils.createUser(server, { email: 'c@c', password: 'c' })
      const newToken = await utils.authenticate(server, 'c@c', 'c')
      const userRes = await req(server)
        .get('/api/users/' + newUser._id)
        .set('Authorization', 'Bearer ' + newToken)

      expect(userRes.status).to.equals(200)
      const userKeys = ['_id', 'email', 'admin', 'created_at', 'updated_at']
      expect(userRes.body).to.have.keys(...userKeys)
    })

    it('Cannot get another user that is not me', async () => {
      const aLoginToken = await utils.authenticate(server, 'a@a', 'a')
      const registerRes = await req(server)
        .get('/api/users/' + userCreated._id)
        .set('Authorization', 'Bearer ' + aLoginToken)

      expect(registerRes.status).to.equals(401)
    })

    it('Can change the users password', async () => {
      const changePass = await req(server)
        .put('/api/users/password/')
        .send({ current_password: 'test', new_password: 'test2' })
        .set('Authorization', 'Bearer ' + userToken)

      expect(changePass.status).to.equals(200)

      const changedLogin = await utils.authenticate(server, 'test@test', 'test2')
      expect(changedLogin).to.exist
    })

    it('Cannot delete a user as a normal user', async () => {
      const deleteUser = await req(server)
        .del('/api/users/' + userCreated._id)
        .set('Authorization', 'Bearer ' + userToken)

      expect(deleteUser.status).to.equals(401)
    })

    it('Can delete a user as an admin', async () => {
      const deleted = await req(server)
        .del('/api/users/' + userCreated._id)
        .set('Authorization', 'Bearer ' + adminToken)

      expect(deleted.status).to.equals(200)

      const deletedCheck = await req(server)
        .get('/api/users/' + userCreated._id)
        .set('Authorization', 'Bearer ' + adminToken)

      expect(deletedCheck.status).to.equals(404)
    })
  })
})
