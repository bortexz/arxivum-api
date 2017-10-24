/* eslint-env mocha */
// const supertest = require('supertest')
const expect = require('chai').expect
const utils = require('./utils')
const req = require('supertest')
const killable = require('killable')
const http = require('http')

describe('Folders API tests', function () {
  let server
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

    // Let server create the admin user and password
    await utils.tick(1500)

    adminToken = await utils.authenticateAdmin(server)
  })

  after(done => {
    server.kill(() => {
      utils.disconnectDb()
      utils.deleteTestFiles()
      done()
    })
  })

  describe('API', () => {
    let newFolder
    let subfolder
    let uploadedFile

    it('Can create a folder', async () => {
      const newFolderRes = await req(server)
        .post('/api/folders') // files appear under a folder
        .send({name: 'Folder1'})
        .set('Authorization', 'Bearer ' + adminToken)

      expect(newFolderRes.status).to.equals(200)

      newFolder = newFolderRes.body

      expect(newFolder).to.have.property('name')
      expect(newFolder).to.have.property('_id')
      expect(newFolder).to.have.property('path')
    })

    it('Can create a subfolder', async () => {
      const subfolderRes = await req(server)
        .post('/api/folders') // files appear under a folder
        .send({name: 'Folder1', parent: newFolder._id})
        .set('Authorization', 'Bearer ' + adminToken)

      expect(subfolderRes.status).to.equals(200)

      subfolder = subfolderRes.body

      expect(subfolder).to.have.property('name')
      expect(subfolder).to.have.property('_id')
      expect(subfolder).to.have.property('path')
      expect(subfolder).to.have.property('parent')
      expect(subfolder.parent).to.equals(newFolder._id)
    })

    it('Should get a folder with its subfolders and files', async () => {
      // First upload 1 file
      const uploadFile = await req(server)
        .post('/api/files?folder=' + newFolder._id)
        .set('Authorization', 'Bearer ' + adminToken)
        .attach('TestFile', 'test/test-file.txt')

      uploadedFile = uploadFile.body[0]

      const getFolder = await req(server)
        .get('/api/folders/' + newFolder._id) // files appear under a folder
        .set('Authorization', 'Bearer ' + adminToken)

      expect(getFolder.status).to.equals(200)

      const folderInfo = getFolder.body
      expect(folderInfo).to.have.property('files')
      expect(folderInfo).to.have.property('folders')

      expect(folderInfo.files.length).to.equals(1)
      expect(folderInfo.folders.length).to.equals(1)

      // check basic properties nesting
      expect(folderInfo.files[0]).to.have.keys('_id', 'name', 'size', 'torrent')
      expect(folderInfo.folders[0]).to.have.keys('_id', 'name', 'path', 'parent')
    })

    it('Can modify the name of a folder', async () => {
      const patchName = await req(server)
        .patch('/api/folders/' + newFolder._id) // files appear under a folder
        .send({name: 'Folder2'})
        .set('Authorization', 'Bearer ' + adminToken)

      expect(patchName.status).to.equals(200)

      const getNew = await req(server)
        .get('/api/folders/' + newFolder._id)
        .set('Authorization', 'Bearer ' + adminToken)

      expect(getNew.body.name).to.equals('Folder2')
    })

    it('Delete a simple folder', async () => {
      // Delete subfolder -> no files on it
      const deleteFolder = await req(server)
        .del('/api/folders/' + subfolder._id)
        .set('Authorization', 'Bearer ' + adminToken)

      expect(deleteFolder.status).to.equals(200)

      const deleted = await req(server)
        .get('/api/folders/' + subfolder._id)
        .set('Authorization', 'Bearer ' + adminToken)

      expect(deleted.status).to.equals(404)
    })

    it('Delete folder removes all files and folders inside', async () => {
      // Create another subfolder
      const newSubfolder = await req(server)
        .post('/api/folders') // files appear under a folder
        .send({name: 'Folder1', parent: newFolder._id})
        .set('Authorization', 'Bearer ' + adminToken)

      const deletedFolder = await req(server)
        .del('/api/folders/' + newFolder._id)
        .set('Authorization', 'Bearer ' + adminToken)

      expect(deletedFolder.status).to.equals(200)

      const trySubfolder = await req(server)
        .get('/api/folders/' + newSubfolder.body._id)
        .set('Authorization', 'Bearer ' + adminToken)

      expect(trySubfolder.status).to.equals(404)

      const tryFile = await req(server)
        .get('/api/files/' + uploadedFile._id)
        .set('Authorization', 'Bearer ' + adminToken)

      expect(tryFile.status).to.equals(404)

      // original folder
      const folder = await req(server)
        .get('/api/folders/' + newFolder._id)
        .set('Authorization', 'Bearer ' + adminToken)

      expect(folder.status).to.equals(404)
    })

    describe('Authorization', () => {
      let userToken
      let userNewFolder
      before(async () => {
        this.timeout(300)
        await utils.createUser(server, { email: 'test@test', password: 'test' })
        userToken = await utils.authenticate(server, 'test@test', 'test')
      })

      it('Cannot create a folder as normal user', async () => {
        const newFolderRes = await req(server)
          .post('/api/folders') // files appear under a folder
          .send({name: 'userFolder'})
          .set('Authorization', 'Bearer ' + userToken)

        expect(newFolderRes.status).to.equals(401)
      })

      it('Cannot modify a folder as normal user', async () => {
        const newFolderRes = await req(server)
          .post('/api/folders') // files appear under a folder
          .send({name: 'userFolder'})
          .set('Authorization', 'Bearer ' + adminToken)

        userNewFolder = newFolderRes.body
        const patchName = await req(server)
          .patch('/api/folders/' + userNewFolder._id) // files appear under a folder
          .send({name: 'Folder2'})
          .set('Authorization', 'Bearer ' + userToken)

        expect(patchName.status).to.equals(401)
      })

      it('Cannot delete a folder as normal user', async () => {
        const deleteUserFolder = await req(server)
          .del('/api/folders/' + userNewFolder._id)
          .set('Authorization', 'Bearer ' + userToken)

        expect(deleteUserFolder.status).to.equals(401)
      })

      it('Can get folder info as normal user', async () => {
        const getFolders = await req(server)
          .get('/api/folders') // files appear under a folder
          .set('Authorization', 'Bearer ' + userToken)

        expect(getFolders.status).to.equals(200)
      })
    })
  })
})
