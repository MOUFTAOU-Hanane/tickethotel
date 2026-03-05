const pool = require('../config/db')
const { v4: uuidv4 } = require('uuid')

const genRef = () => 'TH-' + Math.floor(10000 + Math.random() * 90000)

exports.getAll = async (req, res) => {
  try {
    const { role, hotel_id, id: userId } = req.user
    let query, params = []

    if (role === 'SuperAdmin') {
      query = `SELECT t.*, h.name as hotel_name, c.name as category_name, c.color as category_color,
        u.first_name||' '||u.last_name as technician_name, sp.name as scan_point_name
        FROM tickets t LEFT JOIN hotels h ON t.hotel_id=h.id LEFT JOIN categories c ON t.category_id=c.id
        LEFT JOIN users u ON t.assigned_to=u.id LEFT JOIN scan_points sp ON t.scan_point_id=sp.id
        ORDER BY t.created_at DESC`
    } else if (role === 'Admin') {
      query = `SELECT t.*, h.name as hotel_name, c.name as category_name, c.color as category_color,
        u.first_name||' '||u.last_name as technician_name, sp.name as scan_point_name
        FROM tickets t LEFT JOIN hotels h ON t.hotel_id=h.id LEFT JOIN categories c ON t.category_id=c.id
        LEFT JOIN users u ON t.assigned_to=u.id LEFT JOIN scan_points sp ON t.scan_point_id=sp.id
        WHERE t.hotel_id=$1 ORDER BY t.created_at DESC`
      params = [hotel_id]
    } else {
      query = `SELECT t.*, h.name as hotel_name, c.name as category_name, c.color as category_color,
        sp.name as scan_point_name
        FROM tickets t LEFT JOIN hotels h ON t.hotel_id=h.id LEFT JOIN categories c ON t.category_id=c.id
        LEFT JOIN scan_points sp ON t.scan_point_id=sp.id
        WHERE t.assigned_to=$1 ORDER BY t.created_at DESC`
      params = [userId]
    }
    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.getById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, h.name as hotel_name, c.name as category_name, c.color as category_color,
       u.first_name||' '||u.last_name as technician_name, u.email as technician_email,
       sp.name as scan_point_name
       FROM tickets t LEFT JOIN hotels h ON t.hotel_id=h.id LEFT JOIN categories c ON t.category_id=c.id
       LEFT JOIN users u ON t.assigned_to=u.id LEFT JOIN scan_points sp ON t.scan_point_id=sp.id
       WHERE t.id=$1`, [req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Ticket non trouve' })

    const comments = await pool.query(
      `SELECT cm.*, u.first_name||' '||u.last_name as author_name
       FROM comments cm LEFT JOIN users u ON cm.user_id=u.id
       WHERE cm.ticket_id=$1 ORDER BY cm.created_at ASC`, [req.params.id]
    )
    const history = await pool.query(
      `SELECT th.*, u.first_name||' '||u.last_name as author_name
       FROM ticket_history th LEFT JOIN users u ON th.user_id=u.id
       WHERE th.ticket_id=$1 ORDER BY th.created_at ASC`, [req.params.id]
    )
    res.json({ ...rows[0], comments: comments.rows, history: history.rows })
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.create = async (req, res) => {
  const { title, description, category_id, scan_point_id, predefined_fault_id, client_email, client_phone, client_name, hotel_id, priority } = req.body
  try {
    let faultPriority = priority || 'NORMALE'
    if (predefined_fault_id) {
      const f = await pool.query('SELECT default_priority FROM predefined_faults WHERE id=$1', [predefined_fault_id])
      if (f.rows[0]) faultPriority = f.rows[0].default_priority
    }
    const ref = genRef()
    const hid = hotel_id || req.user?.hotel_id
    const { rows } = await pool.query(
      `INSERT INTO tickets (reference,title,description,status,priority,hotel_id,category_id,scan_point_id,predefined_fault_id,client_email,client_phone,client_name)
       VALUES ($1,$2,$3,'OPEN',$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [ref, title, description, faultPriority, hid, category_id, scan_point_id, predefined_fault_id, client_email, client_phone, client_name]
    )
    await pool.query('INSERT INTO ticket_history(ticket_id,action) VALUES($1,$2)', [rows[0].id, 'Ticket cree'])
    res.status(201).json(rows[0])
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.update = async (req, res) => {
  const { status, assigned_to, priority } = req.body
  try {
    const existing = await pool.query('SELECT * FROM tickets WHERE id=$1', [req.params.id])
    if (!existing.rows[0]) return res.status(404).json({ error: 'Ticket non trouve' })

    const updates = [], vals = []
    let i = 1
    if (status) { updates.push(`status=$${i++}`); vals.push(status) }
    if (assigned_to !== undefined) { updates.push(`assigned_to=$${i++}`); vals.push(assigned_to || null) }
    if (priority) { updates.push(`priority=$${i++}`); vals.push(priority) }
    updates.push(`updated_at=$${i++}`); vals.push(new Date())
    vals.push(req.params.id)

    const { rows } = await pool.query(`UPDATE tickets SET ${updates.join(',')} WHERE id=$${i} RETURNING *`, vals)

    if (status) await pool.query('INSERT INTO ticket_history(ticket_id,user_id,action) VALUES($1,$2,$3)', [req.params.id, req.user.id, `Statut change en ${status}`])
    if (assigned_to) await pool.query('INSERT INTO ticket_history(ticket_id,user_id,action) VALUES($1,$2,$3)', [req.params.id, req.user.id, `Ticket assigne manuellement`])

    res.json(rows[0])
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.addComment = async (req, res) => {
  const { content } = req.body
  if (!content) return res.status(400).json({ error: 'Contenu requis' })
  try {
    const { rows } = await pool.query(
      'INSERT INTO comments(content,ticket_id,user_id) VALUES($1,$2,$3) RETURNING *',
      [content, req.params.id, req.user.id]
    )
    const u = await pool.query('SELECT first_name,last_name FROM users WHERE id=$1', [req.user.id])
    await pool.query('INSERT INTO ticket_history(ticket_id,user_id,action) VALUES($1,$2,$3)', [req.params.id, req.user.id, 'Commentaire ajoute'])
    res.status(201).json({ ...rows[0], author_name: `${u.rows[0].first_name} ${u.rows[0].last_name}` })
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.escalate = async (req, res) => {
  const { new_technician_id } = req.body
  try {
    const t = await pool.query('SELECT * FROM tickets WHERE id=$1', [req.params.id])
    if (!t.rows[0]) return res.status(404).json({ error: 'Ticket non trouve' })
    await pool.query('INSERT INTO ticket_history(ticket_id,user_id,action) VALUES($1,$2,$3)', [req.params.id, req.user.id, `Escalade — ancien tech archive`])
    const { rows } = await pool.query(
      'UPDATE tickets SET assigned_to=$1,status=\'ESCALATED\',updated_at=NOW() WHERE id=$2 RETURNING *',
      [new_technician_id, req.params.id]
    )
    res.json(rows[0])
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.aiAssign = async (req, res) => {
  try {
    const ticket = await pool.query('SELECT * FROM tickets WHERE id=$1', [req.params.id])
    if (!ticket.rows[0]) return res.status(404).json({ error: 'Ticket non trouve' })
    const t = ticket.rows[0]

    const cat = await pool.query('SELECT name FROM categories WHERE id=$1', [t.category_id])
    const catName = cat.rows[0]?.name || ''

    const techs = await pool.query(
      `SELECT u.*, COUNT(t2.id) as open_tickets FROM users u
       LEFT JOIN tickets t2 ON t2.assigned_to=u.id AND t2.status IN ('OPEN','IN_PROGRESS')
       WHERE u.hotel_id=$1 AND u.role='Technicien' AND u.status='actif'
       GROUP BY u.id ORDER BY open_tickets ASC`,
      [t.hotel_id]
    )

    const threshold = parseInt(process.env.AI_ASSIGNMENT_THRESHOLD) || 5
    let best = null
    for (const tech of techs.rows) {
      if (parseInt(tech.open_tickets) >= threshold) continue
      if (tech.skills && tech.skills.some(s => catName.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(catName.toLowerCase()))) {
        best = tech; break
      }
    }
    if (!best && techs.rows.length) best = techs.rows[0]
    if (!best) return res.status(400).json({ error: 'Aucun technicien disponible' })

    const { rows } = await pool.query(
      'UPDATE tickets SET assigned_to=$1,status=\'IN_PROGRESS\',assigned_by_ai=true,updated_at=NOW() WHERE id=$2 RETURNING *',
      [best.id, t.id]
    )
    await pool.query('INSERT INTO ticket_history(ticket_id,user_id,action,assigned_by_ai) VALUES($1,$2,$3,true)',
      [t.id, best.id, `Assigne automatiquement par IA a ${best.first_name} ${best.last_name}`])

    res.json({ ticket: rows[0], technician: best })
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.aiAssignAll = async (req, res) => {
  try {
    const { hotel_id } = req.user
    const open = await pool.query('SELECT id FROM tickets WHERE hotel_id=$1 AND status=\'OPEN\'', [hotel_id])
    const results = []
    for (const t of open.rows) {
      req.params = { id: t.id }
      const mockRes = { json: (d) => results.push(d), status: () => ({ json: () => {} }) }
      await exports.aiAssign({ ...req, params: { id: t.id } }, mockRes)
    }
    res.json({ assigned: results.length, results })
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }) }
}