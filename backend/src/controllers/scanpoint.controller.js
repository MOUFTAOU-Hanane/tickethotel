const pool = require('../config/db')
const QRCode = require('qrcode')
const { v4: uuidv4 } = require('uuid')

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT sp.*, COUNT(t.id) as ticket_count FROM scan_points sp
       LEFT JOIN tickets t ON t.scan_point_id=sp.id
       WHERE sp.hotel_id=$1 GROUP BY sp.id ORDER BY sp.created_at DESC`,
      [req.user.hotel_id]
    )
    res.json(rows)
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.create = async (req, res) => {
  const { name, type, floor, wing } = req.body
  try {
    const id = uuidv4()
    const qrUrl = `${process.env.QR_BASE_URL}/${id}`
    const qrCode = await QRCode.toDataURL(qrUrl)
    const { rows } = await pool.query(
      'INSERT INTO scan_points(id,name,type,floor,wing,hotel_id,qr_code_url) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [id, name, type, floor, wing, req.user.hotel_id, qrCode]
    )
    res.status(201).json(rows[0])
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.toggle = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE scan_points SET status=CASE WHEN status=\'actif\' THEN \'inactif\' ELSE \'actif\' END WHERE id=$1 RETURNING *',
      [req.params.id]
    )
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.getPublic = async (req, res) => {
  try {
    const sp = await pool.query(
      'SELECT sp.*,h.name as hotel_name FROM scan_points sp JOIN hotels h ON sp.hotel_id=h.id WHERE sp.id=$1 AND sp.status=\'actif\'',
      [req.params.id]
    )
    if (!sp.rows[0]) return res.status(404).json({ error: 'Point de scan non trouve' })
    const faults = await pool.query(
      `SELECT pf.*,c.name as category_name,c.color FROM predefined_faults pf
       JOIN categories c ON pf.category_id=c.id
       WHERE pf.hotel_id=$1 AND pf.active=true ORDER BY pf.name`,
      [sp.rows[0].hotel_id]
    )
    res.json({ scan_point: sp.rows[0], faults: faults.rows })
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}