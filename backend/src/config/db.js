const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tickethotel',
  user: process.env.DB_USER || 'tickethotel_user',
  password: process.env.DB_PASSWORD || 'devpassword123',
})

pool.on('connect', () => console.log('✅ PostgreSQL connecte'))
pool.on('error', (err) => console.error('❌ PostgreSQL erreur', err))

module.exports = pool