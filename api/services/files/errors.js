const ENCRYPTION_ERROR =
  (name) => `Error while encrypting file: ${name}`

const FILESYSTEM_SAVE_ERROR = 'Error while writing file to filesystem'

const GENERATE_TORRENT_ERROR =
  (name) => `Error while generating file torrent: ${name}`

const SAVE_DATABASE_ERROR =
  (name) => `Error while saving file model to database: ${name}`

const GENERATE_CRYPTO_KEY_ERROR = 'Error while generating cryptographic key'

const FILE_NOT_FOUND_ERROR = (params) => `File not found: ${params}`

module.exports = {
  ENCRYPTION_ERROR,
  FILESYSTEM_SAVE_ERROR,
  GENERATE_TORRENT_ERROR,
  SAVE_DATABASE_ERROR,
  GENERATE_CRYPTO_KEY_ERROR,
  FILE_NOT_FOUND_ERROR
}
