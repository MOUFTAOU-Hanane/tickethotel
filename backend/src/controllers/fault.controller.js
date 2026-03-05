const pool = require('../config/db')

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pf.*,c.name as category_name,c.color FROM predefined_faults pf
       LEFT JOIN categories c ON pf.category_id=c.id
       WHERE pf.hotel_id=$1 ORDER BY pf.name`,
      [req.user.hotel_id]
    )
    res.json(rows)
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.create = async (req, res) => {
  const { name, category_id, default_priority } = req.body
  try {
    const { rows } = await pool.query(
      'INSERT INTO predefined_faults(name,category_id,default_priority,hotel_id) VALUES($1,$2,$3,$4) RETURNING *',
      [name, category_id, default_priority || 'NORMALE', req.user.hotel_id]
    )
    res.status(201).json(rows[0])
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.toggle = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE predefined_faults SET active=NOT active WHERE id=$1 RETURNING *',
      [req.params.id]
    )
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM predefined_faults WHERE id=$1', [req.params.id])
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}