const pool = require('../config/db')
const { v4: uuidv4 } = require('uuid')

const analyzeSentiment = (comment, rating) => {
  if (!comment) return { sentiment: rating >= 4 ? 'POSITIF' : rating <= 2 ? 'NEGATIF' : 'NEUTRE', score: rating * 20 }
  const pos = ['excellent','super','parfait','rapide','efficace','merci','poli','professionnel','top','bravo']
  const neg = ['mauvais','nul','lent','probleme','insupportable','decu','inefficace','mauvaise','horrible','inacceptable']
  const text = comment.toLowerCase()
  const posScore = pos.filter(w => text.includes(w)).length
  const negScore = neg.filter(w => text.includes(w)).length
  let sentiment = 'NEUTRE', score = 60
  if (posScore > negScore || rating >= 4) { sentiment = 'POSITIF'; score = 70 + posScore * 10 }
  if (negScore > posScore || rating <= 2) { sentiment = 'NEGATIF'; score = 70 + negScore * 10 }
  return { sentiment, score: Math.min(score, 99) }
}

exports.create = async (req, res) => {
  const { token, rating, comment } = req.body
  try {
    const review = await pool.query('SELECT * FROM reviews WHERE review_token=$1', [token])
    if (!review.rows[0]) return res.status(404).json({ error: 'Lien invalide ou expire' })
    if (review.rows[0].rating) return res.status(400).json({ error: 'Avis deja soumis' })
    const { sentiment, score } = analyzeSentiment(comment, rating)
    const themes = []
    if (comment) {
      if (comment.toLowerCase().includes('rapide')) themes.push('Rapidite')
      if (comment.toLowerCase().includes('poli') || comment.toLowerCase().includes('aimable')) themes.push('Amabilite')
      if (comment.toLowerCase().includes('propre')) themes.push('Proprete')
      if (comment.toLowerCase().includes('bruit')) themes.push('Bruit')
    }
    const { rows } = await pool.query(
      'UPDATE reviews SET rating=$1,comment=$2,sentiment=$3,sentiment_score=$4,themes=$5 WHERE review_token=$6 RETURNING *',
      [rating, comment, sentiment, score, themes, token]
    )
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.getAll = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.*,t.reference,u.first_name||' '||u.last_name as technician_name
       FROM reviews r JOIN tickets t ON r.ticket_id=t.id LEFT JOIN users u ON t.assigned_to=u.id
       WHERE t.hotel_id=$1 AND r.rating IS NOT NULL ORDER BY r.created_at DESC`,
      [req.user.hotel_id]
    )
    res.json(rows)
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.toggleVisibility = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'UPDATE reviews SET visible=NOT visible WHERE id=$1 RETURNING *', [req.params.id]
    )
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}

exports.getStats = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ROUND(AVG(rating),1) as avg, COUNT(*) as total,
       SUM(CASE WHEN sentiment='POSITIF' THEN 1 ELSE 0 END) as positive,
       SUM(CASE WHEN sentiment='NEGATIF' THEN 1 ELSE 0 END) as negative
       FROM reviews r JOIN tickets t ON r.ticket_id=t.id
       WHERE t.hotel_id=$1 AND r.rating IS NOT NULL`,
      [req.user.hotel_id]
    )
    res.json(rows[0])
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }) }
}