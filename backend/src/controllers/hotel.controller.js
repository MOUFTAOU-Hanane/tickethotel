const pool = require('../config/db')

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT h.*, p.name as plan_name, p.base_cost,
       COUNT(DISTINCT u.id) as user_count,
       COUNT(DISTINCT t.id) as ticket_count
       FROM hotels h LEFT JOIN plans p ON h.plan_id=p.id
       LEFT JOIN users u ON u.hotel_id=h.id
       LEFT JOIN tickets t ON t.hotel_id=h.id
       GROUP BY h.id,p.name,p.base_cost ORDER BY h.created_at DESC`
    )
    res.json(rows)
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.getById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT h.*,p.name as plan_name,p.base_cost,p.max_technicians,p.ticket_quota,p.has_ai FROM hotels h LEFT JOIN plans p ON h.plan_id=p.id WHERE h.id=$1',
      [req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Hotel non trouve' })
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.create = async (req, res) => {
  const { name, address, plan_id } = req.body
  try {
    const { rows } = await pool.query(
      'INSERT INTO hotels(name,address,plan_id) VALUES($1,$2,$3) RETURNING *',
      [name, address, plan_id]
    )
    res.status(201).json(rows[0])
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.getPayments = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM payments WHERE hotel_id=$1 ORDER BY paid_at DESC', [req.params.id]
    )
    res.json(rows)
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.addPayment = async (req, res) => {
  const { amount, description, next_payment_at } = req.body
  try {
    const { rows } = await pool.query(
      'INSERT INTO payments(hotel_id,amount,description,next_payment_at) VALUES($1,$2,$3,$4) RETURNING *',
      [req.params.id, amount, description, next_payment_at]
    )
    res.status(201).json(rows[0])
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.getStats = async (req, res) => {
  try {
    const id = req.params.id || req.user.hotel_id
    const [tickets, techs, payments, reviews] = await Promise.all([
      pool.query(`SELECT status, COUNT(*) as count FROM tickets WHERE hotel_id=$1 GROUP BY status`, [id]),
      pool.query(`SELECT COUNT(*) as count FROM users WHERE hotel_id=$1 AND role='Technicien' AND status='actif'`, [id]),
      pool.query(`SELECT * FROM payments WHERE hotel_id=$1 ORDER BY paid_at DESC LIMIT 1`, [id]),
      pool.query(`SELECT ROUND(AVG(rating),1) as avg_rating FROM reviews r JOIN tickets t ON r.ticket_id=t.id WHERE t.hotel_id=$1`, [id]),
    ])
    const byStatus = {}
    tickets.rows.forEach(r => byStatus[r.status] = parseInt(r.count))
    res.json({
      tickets: byStatus,
      total_tickets: Object.values(byStatus).reduce((a, b) => a + b, 0),
      technicians: parseInt(techs.rows[0].count),
      last_payment: payments.rows[0],
      avg_rating: parseFloat(reviews.rows[0].avg_rating) || 0
    })
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}