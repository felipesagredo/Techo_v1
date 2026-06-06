const {
  getAllAddresses,
  createAddress,
  updateAddressById,
  deleteAddressById,
} = require('../services/Address.service');

const { validateCoordinates, validateColor } = require('../validations/address.validations');

exports.getAll = async (req, res) => {
  try {
    const result = await getAllAddresses();
    res.json({ addresses: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener direcciones' });
  }
};

exports.create = async (req, res) => {
  const { label, lat, lng, color } = req.body;
  const user = req.user;

  if (!user) return res.status(401).json({ error: 'No autorizado' });

  // Solo admin (role_id === 1) puede crear
  if (user.role_id !== 1) return res.status(403).json({ error: 'Acceso prohibido: solo administradores' });

  if (!label || lat == null || lng == null) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const coordCheck = validateCoordinates(lat, lng);
  if (!coordCheck.valid) {
    return res.status(400).json({ error: coordCheck.message });
  }

  const colorCheck = validateColor(color);
  if (!colorCheck.valid) {
    return res.status(400).json({ error: colorCheck.message });
  }

  try {
    const result = await createAddress({
      label,
      lat: coordCheck.lat,
      lng: coordCheck.lng,
      color: colorCheck.color,
      createdBy: user.id,
    });
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

  const coordCheck = validateCoordinates(lat, lng);
  if (!coordCheck.valid) {
    return res.status(400).json({ error: coordCheck.message });
  }

  try {
    const result = await updateAddressById({
      id,
      label,
      lat: coordCheck.lat,
      lng: coordCheck.lng,
    });

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
    const result = await deleteAddressById(id);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dirección no encontrada' });
    }

    res.json({ message: 'Dirección eliminada', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error eliminando dirección' });
  }
};
