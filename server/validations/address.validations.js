// Validación simple de coordenadas lat/lng
function isFiniteNumber(n) {
  return typeof n === 'number' && isFinite(n);
}

function validateCoordinates(lat, lng) {
  // Rechazar valores vacíos ('' or only whitespace) y nulos/undefined
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

module.exports = { validateCoordinates };
