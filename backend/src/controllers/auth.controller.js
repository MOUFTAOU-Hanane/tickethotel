const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')

exports.login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ error: 'Email et mot de passe requis' })

  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    )
    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'Identifiants incorrects' })
    if (user.status === 'inactif') return res.status(403).json({ error: 'Compte inactif' })
    if (user.locked_until && new Date(user.locked_until) > new Date())
      return res.status(423).json({ error: 'Compte verrouille temporairement' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      const attempts = (user.login_attempts || 0) + 1
      const lock = attempts >= (process.env.MAX_LOGIN_ATTEMPTS || 5)
      await pool.query(
        'UPDATE users SET login_attempts=$1, locked_until=$2 WHERE id=$3',
        [attempts, lock ? new Date(Date.now() + 15 * 60000) : null, user.id]
      )
      return res.status(401).json({ error: 'Identifiants incorrects' })
    }

    await pool.query('UPDATE users SET login_attempts=0, locked_until=NULL WHERE id=$1', [user.id])

    let hotelName = null
    if (user.hotel_id) {
      const h = await pool.query('SELECT name FROM hotels WHERE id=$1', [user.hotel_id])
      hotelName = h.rows[0]?.name
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, hotel_id: user.hotel_id, hotelName },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    )
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, firstName: user.first_name, lastName: user.last_name, hotel_id: user.hotel_id, hotelName } })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

exports.me = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id,email,first_name,last_name,role,hotel_id,skills,status FROM users WHERE id=$1', [req.user.id])
    res.json(rows[0])
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}