require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const fs = require('fs')
const path = require('path')
const pool = require('./config/db')
const routes = require('./routes')

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Trop de requetes' }))

app.use('/api/v1', routes)

app.use((req, res) => res.status(404).json({ error: 'Route non trouvee' }))
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Erreur interne' }) })

const PORT = process.env.PORT || 3000

async function initDB() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'db/init.sql'), 'utf8')
    await pool.query(sql)
    console.log('✅ Base de donnees initialisees')
  } catch (e) {
    console.log('ℹ️ Init info:', e.message)
  }

  try {
    await pool.query(`
  UPDATE users SET password_hash = '$2a$10$fA.28uIDYGYhXTw6eW8U0.8yuL/fVpl565xL3f4sxjUMGLnC0MNTm'
  WHERE email IN ('superadmin@tickethotel.com', 'admin@grandbleu.com', 'thomas@grandbleu.com', 'sophie@grandbleu.com')
`)
    console.log('✅ Mots de passe mis a jour')
  } catch (e) {
    console.log('❌ Erreur UPDATE passwords:', e.message)
  }
}
async function start() {
  await initDB()
  app.listen(PORT, () => console.log(`🚀 TicketHotel API sur http://localhost:${PORT}`))
}



start()