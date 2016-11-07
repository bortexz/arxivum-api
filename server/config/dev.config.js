const config = {
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost/arxivum-dev',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin',
  JWT_SECRET: process.env.JWT_SECRET || 's0m3th1nG_R4nd0M'
}

module.exports = config
