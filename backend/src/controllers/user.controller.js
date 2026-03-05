const pool = require('../config/db')
const bcrypt = require('bcryptjs')

exports.getAll = async (req, res) => {
  try {
    const { role, hotel_id } = req.user
    const where = role === 'SuperAdmin' ? '' : 'WHERE u.hotel_id=$1'
    const params = role === 'SuperAdmin' ? [] : [hotel_id]
    const { rows } = await pool.query(
      `SELECT u.id,u.email,u.first_name,u.last_name,u.role,u.skills,u.status,u.hotel_id,
       h.name as hotel_name, COUNT(t.id) as open_tickets
       FROM users u LEFT JOIN hotels h ON u.hotel_id=h.id
       LEFT JOIN tickets t ON t.assigned_to=u.id AND t.status IN ('OPEN','IN_PROGRESS')
       ${where} GROUP BY u.id,h.name ORDER BY u.created_at DESC`, params
    )
    res.json(rows)
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.create = async (req, res) => {
  const { email, password, first_name, last_name, role, hotel_id, skills } = req.body
  try {
    const hash = await bcrypt.hash(password || 'password123', 10)
    const hid = hotel_id || req.user.hotel_id
    const { rows } = await pool.query(
      'INSERT INTO users(email,password_hash,first_name,last_name,role,hotel_id,skills) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,email,first_name,last_name,role,hotel_id,skills,status',
      [email, hash, first_name, last_name, role, hid, skills || []]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'Email deja utilise' })
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

exports.update = async (req, res) => {
  const { first_name, last_name, skills, status, role } = req.body
  try {
    const { rows } = await pool.query(
      'UPDATE users SET first_name=$1,last_name=$2,skills=$3,status=$4,role=$5 WHERE id=$6 RETURNING id,email,first_name,last_name,role,hotel_id,skills,status',
      [first_name, last_name, skills || [], status, role, req.params.id]
    )
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.remove = async (req, res) => {
  try {
    await pool.query('UPDATE users SET status=\'inactif\' WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}