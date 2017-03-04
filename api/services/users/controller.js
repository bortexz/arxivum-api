const User = require('./model')

module.exports = {
  createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser
}

const FIELDS = '_id name email password admin created_at updated_at'

async function createUser (data, admin = false) {
  data.admin = admin
  const newUser = new User(data)
  return await newUser.save()
}

async function getUser (_id, fields = FIELDS) {
  return await User
    .findOne({ _id })
    .select(fields)
}

async function getUsers (fields = FIELDS) {
  return await User
      .find()
      .select(fields)
}

async function updateUser (_id, body, fields = FIELDS) {
  return await User.findOneAndUpdate(
    {_id},
    { $set: body },
    {fields}
  )
}

async function deleteUser (_id) {
  return await User.remove({ _id, admin: false })
}
