const router = require('express').Router()
const auth = require('../middlewares/auth')
const authCtrl = require('../controllers/auth.controller')
const ticketCtrl = require('../controllers/ticket.controller')
const userCtrl = require('../controllers/user.controller')
const hotelCtrl = require('../controllers/hotel.controller')
const scanCtrl = require('../controllers/scanpoint.controller')
const faultCtrl = require('../controllers/fault.controller')
const reviewCtrl = require('../controllers/review.controller')

// Health
router.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }))

// Auth
router.post('/auth/login', authCtrl.login)
router.get('/auth/me', auth(), authCtrl.me)

// Tickets
router.get('/tickets', auth(), ticketCtrl.getAll)
router.post('/tickets', ticketCtrl.create)
router.get('/tickets/:id', auth(), ticketCtrl.getById)
router.patch('/tickets/:id', auth(['Admin','SuperAdmin']), ticketCtrl.update)
router.post('/tickets/:id/comments', auth(), ticketCtrl.addComment)
router.post('/tickets/:id/escalate', auth(['Admin','SuperAdmin']), ticketCtrl.escalate)
router.post('/tickets/:id/ai-assign', auth(['Admin','SuperAdmin']), ticketCtrl.aiAssign)
router.post('/ai/assign-all', auth(['Admin','SuperAdmin']), ticketCtrl.aiAssignAll)

// Users
router.get('/users', auth(['Admin','SuperAdmin']), userCtrl.getAll)
router.post('/users', auth(['Admin','SuperAdmin']), userCtrl.create)
router.put('/users/:id', auth(['Admin','SuperAdmin']), userCtrl.update)
router.delete('/users/:id', auth(['Admin','SuperAdmin']), userCtrl.remove)

// Hotels
router.get('/hotels', auth(['SuperAdmin']), hotelCtrl.getAll)
router.post('/hotels', auth(['SuperAdmin']), hotelCtrl.create)
router.get('/hotels/:id', auth(), hotelCtrl.getById)
router.get('/hotels/:id/payments', auth(['Admin','SuperAdmin']), hotelCtrl.getPayments)
router.post('/hotels/:id/payments', auth(['SuperAdmin']), hotelCtrl.addPayment)
router.get('/hotels/:id/stats', auth(), hotelCtrl.getStats)
router.get('/stats', auth(), (req, res, next) => { req.params.id = req.user.hotel_id; next() }, hotelCtrl.getStats)

// QR Codes
router.get('/scan-points', auth(['Admin','SuperAdmin']), scanCtrl.getAll)
router.post('/scan-points', auth(['Admin','SuperAdmin']), scanCtrl.create)
router.patch('/scan-points/:id/toggle', auth(['Admin','SuperAdmin']), scanCtrl.toggle)
router.get('/public/scan/:id', scanCtrl.getPublic)

// Pannes predefinies
router.get('/faults', auth(['Admin','SuperAdmin']), faultCtrl.getAll)
router.post('/faults', auth(['Admin','SuperAdmin']), faultCtrl.create)
router.patch('/faults/:id/toggle', auth(['Admin','SuperAdmin']), faultCtrl.toggle)
router.delete('/faults/:id', auth(['Admin','SuperAdmin']), faultCtrl.remove)

// Avis clients
router.post('/reviews', reviewCtrl.create)
router.get('/reviews', auth(['Admin','SuperAdmin']), reviewCtrl.getAll)
router.patch('/reviews/:id/visibility', auth(['Admin','SuperAdmin']), reviewCtrl.toggleVisibility)
router.get('/reviews/stats', auth(['Admin','SuperAdmin']), reviewCtrl.getStats)

// Plans
router.get('/plans', async (req, res) => {
  const pool = require('../config/db')
  const { rows } = await pool.query('SELECT * FROM plans ORDER BY base_cost')
  res.json(rows)
})

// Categories
router.get('/categories', auth(), async (req, res) => {
  const pool = require('../config/db')
  const hid = req.user.hotel_id
  const { rows } = await pool.query('SELECT * FROM categories WHERE hotel_id=$1', [hid])
  res.json(rows)
})

router.get('/debug-users', async (req, res) => {
  const pool = require('../config/db')
  const { rows } = await pool.query('SELECT email, password_hash FROM users')
  res.json(rows)
})
module.exports = router