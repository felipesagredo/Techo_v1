const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. No hay token.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123');
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Token no válido.' });
  }
};
