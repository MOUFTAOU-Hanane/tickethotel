require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
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
app.listen(PORT, () => console.log(`🚀 TicketHotel API sur http://localhost:${PORT}`))