const jwt = require('jsonwebtoken')

const auth = (roles = []) => {
  return (req, res, next) => {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ error: 'Token manquant' })

    const token = header.split(' ')[1]
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.user = decoded
      if (roles.length && !roles.includes(decoded.role))
        return res.status(403).json({ error: 'Acces refuse' })
      next()
    } catch {
      return res.status(401).json({ error: 'Token invalide' })
    }
  }
}

module.exports = auth