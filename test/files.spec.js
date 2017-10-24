/* eslint-env mocha */
// const supertest = require('supertest')
const expect = require('chai').expect
const utils = require('./utils')
const req = require('supertest')
const killable = require('killable')
const http = require('http')
const parseTorrent = require('parse-torrent')
const fs = require('fs')
const path = require('path')

describe('Files upload and API tests', function () {
  let server
  let webseed
  let testFileId
  let adminToken

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

    const webseedApp = require('../webseed/webseed')

    webseed = http.createServer(webseedApp.callback()).listen(process.env.WEBSEED_PORT)
    webseed = killable(webseed)

    adminToken = await utils.authenticateAdmin(server)
    // Let server create the admin user and password
    await utils.tick(1500)
  })

  after(done => {
    server.kill(() => webseed.kill(() => {
      utils.disconnectDb()
      utils.deleteTestFiles()
      done()
    }))
  })

  describe('Upload file and webseed', () => {
    it('Upload file response ok', async () => {
      const res = await req(server)
        .post('/api/files')
        .set('Authorization', 'Bearer ' + adminToken)
        .attach('TestFile', 'test/test-file.txt')

      expect(res.status).to.equals(200)
    })

    it('Cannot upload file as normal user', async () => {
      await utils.createUser(server, 'test@test', 'test')
      const userToken = utils.authenticate(server, 'test@test', 'test')

      const res = await req(server)
        .post('/api/files')
        .set('Authorization', 'Bearer ' + userToken)
        .attach('TestFile', 'test/test-file.txt')

      expect(res.status).to.equals(401)
    })

    it('I can download the file from the webseed by byte range', async () => {
      const filesList = await req(server)
        .get('/api/folders') // files appear under a folder
        .set('Authorization', 'Bearer ' + adminToken)

      const file = filesList.body.files[0]
      const webseedUrl = parseTorrent(new Buffer(file.torrent.data)).urlList[0].split('/')
      const webseedPath = webseedUrl[webseedUrl.length - 1]

      const binary = await req(webseed)
        .get('/' + webseedPath)
        .set('range', 'bytes=0-15')

      expect(binary.status).to.equals(206)
      expect(binary.body.length).to.equals(16)
      expect(Buffer.isBuffer(binary.body)).to.be.true
    })

    it('The webseed sends 416 Range unsatisfiable if no range sent', async () => {
      const filesList = await req(server)
        .get('/api/folders') // files appear under a folder
        .set('Authorization', 'Bearer ' + adminToken)

      const file = filesList.body.files[0]
      const webseedUrl = parseTorrent(new Buffer(file.torrent.data)).urlList[0].split('/')
      const webseedPath = webseedUrl[webseedUrl.length - 1]

      const binary = await req(webseed)
        .get('/' + webseedPath)

      expect(binary.status).to.equals(416)
    })
  })

  describe('Files API', () => {
    // get, del, patch

    it('I can access some metadata of the file in the folders content', async () => {
      const res = await req(server)
        .get('/api/folders') // files appear under a folder
        .set('Authorization', 'Bearer ' + adminToken)

      const file = res.body.files[0]

      testFileId = file._id // To use in the following tests

      expect(file).to.have.property('_id')
      expect(file).to.have.property('name')
      expect(file).to.have.property('size')
      expect(file).to.have.property('torrent')
    })

    it('Can get 1 file metadata', async () => {
      const fileMD = await req(server)
        .get('/api/files/' + testFileId)
        .set('Authorization', 'Bearer ' + adminToken)

      expect(fileMD.status).to.equals(200)

      const file = fileMD.body
      expect(file).to.have.property('_id')
      expect(file).to.have.property('name')
      expect(file).to.have.property('size')
      expect(file).to.have.property('torrent')
      expect(file).to.have.property('encryption_key')
    })

    it('Can change the name of a file', async () => {
      const name = 'TestFile.txt'

      const res = await req(server)
        .patch('/api/files/' + testFileId)
        .set('Authorization', 'Bearer ' + adminToken)
        .send({ name })

      expect(res.status).to.equals(200)

      const changed = await req(server)
        .get('/api/files/' + testFileId)
        .set('Authorization', 'Bearer ' + adminToken)

      expect(changed.body.name).to.equals(name)
    })

    it('Can delete the file', async () => {
      it('Can change the name of a file', async () => {
        const res = await req(server)
          .del('/api/files/' + testFileId)
          .set('Authorization', 'Bearer ' + adminToken)

        expect(res.status).to.equals(200)

        const deleted = await req(server)
          .get('/api/files/' + testFileId)
          .set('Authorization', 'Bearer ' + adminToken)

        expect(deleted.status).to.equals(404)

        // checks it has been deleted from file
        const dir = path.resolve(__dirname, './files')
        if (fs.existsSync(dir)) {
          expect(fs.readdirSync(dir).length).to.equals(0)
        }
      })
    })
  })
})
