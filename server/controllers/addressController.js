const pool = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, label, lat, lng, created_by, created_at FROM addresses ORDER BY id DESC');
    res.json({ addresses: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener direcciones' });
  }
};

exports.create = async (req, res) => {
  const { label, lat, lng } = req.body;
  const user = req.user;

  if (!user) return res.status(401).json({ error: 'No autorizado' });

  // Solo admin (role_id === 1) puede crear
  if (user.role_id !== 1) return res.status(403).json({ error: 'Acceso prohibido: solo administradores' });

  if (!label || lat == null || lng == null) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO addresses (label, lat, lng, created_by) VALUES ($1, $2, $3, $4) RETURNING id, label, lat, lng, created_by, created_at',
      [label, lat, lng, user.id]
    );
    res.status(201).json({ address: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando dirección' });
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { label, lat, lng } = req.body;
  const user = req.user;

  if (!user) return res.status(401).json({ error: 'No autorizado' });

  // Solo admin puede editar
  if (user.role_id !== 1) return res.status(403).json({ error: 'Acceso prohibido: solo administradores' });

  if (!label || lat == null || lng == null) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const result = await pool.query(
      'UPDATE addresses SET label = $1, lat = $2, lng = $3 WHERE id = $4 RETURNING id, label, lat, lng, created_by, created_at',
      [label, lat, lng, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    res.json({ address: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando dirección' });
  }
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (!user) return res.status(401).json({ error: 'No autorizado' });

  // Solo admin puede eliminar
  if (user.role_id !== 1) return res.status(403).json({ error: 'Acceso prohibido: solo administradores' });

  try {
    const result = await pool.query('DELETE FROM addresses WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    res.json({ message: 'Dirección eliminada', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error eliminando dirección' });
  }
};
