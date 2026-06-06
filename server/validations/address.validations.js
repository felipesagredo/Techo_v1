// Validación simple de coordenadas lat/lng
function isFiniteNumber(n) {
  return typeof n === 'number' && isFinite(n);
}

function validateCoordinates(lat, lng) {
  // Rechazar valores vacíos ('' ) y nulos
  const latStr = lat === null || lat === undefined ? '' : String(lat).trim();
  const lngStr = lng === null || lng === undefined ? '' : String(lng).trim();

  if (latStr === '' || lngStr === '') {
    return { valid: false, message: 'Latitud y longitud deben ser números' };
  }

  const latNum = Number(latStr);
  const lngNum = Number(lngStr);

  if (!isFiniteNumber(latNum) || !isFiniteNumber(lngNum) || Number.isNaN(latNum) || Number.isNaN(lngNum)) {
    return { valid: false, message: 'Latitud y longitud deben ser números' };
  }

  if (latNum < -90 || latNum > 90) {
    return { valid: false, message: 'Latitud fuera de rango (-90 a 90)' };
  }

  if (lngNum < -180 || lngNum > 180) {
    return { valid: false, message: 'Longitud fuera de rango (-180 a 180)' };
  }

  return { valid: true, lat: latNum, lng: lngNum };
}

const ALLOWED_COLORS = ['red', 'purple', 'blue', 'yellow', 'green'];

function validateColor(color) {
  const normalized = typeof color === 'string' ? color.trim().toLowerCase() : '';

  if (!normalized) {
    return { valid: true, color: 'red' };
  }

  if (!ALLOWED_COLORS.includes(normalized)) {
    return { valid: false, message: 'Color inválido' };
  }

  return { valid: true, color: normalized };
}

module.exports = { validateCoordinates, validateColor, ALLOWED_COLORS };
