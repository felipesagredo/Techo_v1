import L from 'leaflet'

export const COLOR_OPTIONS = [
  { value: 'red', label: 'Rojo', hex: '#e53935', description: 'Ubicación de llegada' },
  { value: 'purple', label: 'Morado', hex: '#8e24aa', description: 'Área de comida' },
  { value: 'blue', label: 'Azul', hex: '#1e88e5', description: 'Ubicación de emergencia' },
  { value: 'yellow', label: 'Amarillo', hex: '#fdd835', description: 'Área de trabajo' },
  { value: 'green', label: 'Verde', hex: '#43a047', description: 'Herramientas' },
]

const COLOR_ICON_URLS = {
  red: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  purple: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  blue: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  yellow: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
  green: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
}

export const getColorOption = (color) => COLOR_OPTIONS.find(option => option.value === color) ?? COLOR_OPTIONS[0]

export const getMarkerIcon = (color) => {
  const colorKey = getColorOption(color).value
  return L.icon({
    iconUrl: COLOR_ICON_URLS[colorKey],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
}

export const refreshMarkers = (addrs, layer, isAdminUser) => {
  if (!layer || !Array.isArray(addrs)) return
  layer.clearLayers()
  addrs.forEach(addr => {
    try {
      const lat = parseFloat(addr.lat)
      const lng = parseFloat(addr.lng)
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

      const markerColor = getColorOption(addr.color ?? 'red').value
      const marker = L.marker([lat, lng], {
        icon: getMarkerIcon(markerColor)
      })

      const popup = document.createElement('div')
      popup.style.minWidth = '180px'

      const title = document.createElement('strong')
      title.textContent = addr.label || 'Sin nombre'
      popup.appendChild(title)

      const coordinatesInfo = document.createElement('div')
      coordinatesInfo.style.marginTop = '4px'
      coordinatesInfo.style.fontSize = '12px'
      coordinatesInfo.style.color = '#666'
      coordinatesInfo.textContent = `Latitud: ${lat.toFixed(6)} | Longitud: ${lng.toFixed(6)}`
      popup.appendChild(coordinatesInfo)

      if (isAdminUser) {
        const actions = document.createElement('div')
        actions.style.marginTop = '8px'
        actions.style.display = 'flex'
        actions.style.gap = '4px'

        const editButton = document.createElement('button')
        editButton.textContent = 'Editar'
        editButton.style.padding = '4px 8px'
        editButton.style.background = '#4CAF50'
        editButton.style.color = 'white'
        editButton.style.border = 'none'
        editButton.style.borderRadius = '4px'
        editButton.style.cursor = 'pointer'
        editButton.style.fontSize = '12px'
        editButton.addEventListener('click', () => window.editAddress && window.editAddress(addr.id))

        const deleteButton = document.createElement('button')
        deleteButton.textContent = 'Eliminar'
        deleteButton.style.padding = '4px 8px'
        deleteButton.style.background = '#f44336'
        deleteButton.style.color = 'white'
        deleteButton.style.border = 'none'
        deleteButton.style.borderRadius = '4px'
        deleteButton.style.cursor = 'pointer'
        deleteButton.style.fontSize = '12px'
        deleteButton.addEventListener('click', () => window.deleteAddress && window.deleteAddress(addr.id))

        actions.appendChild(editButton)
        actions.appendChild(deleteButton)
        popup.appendChild(actions)
      }

      marker.bindPopup(popup)
      layer.addLayer(marker)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error añadiendo marcador:', err)
    }
  })
}

export const validateClientCoordinates = (lat, lng) => {
  const latNum = Number(lat)
  const lngNum = Number(lng)
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
    return { valid: false, message: 'Latitud y longitud inválidas' }
  }
  if (latNum < -90 || latNum > 90) return { valid: false, message: 'Latitud fuera de rango (-90 a 90)' }
  if (lngNum < -180 || lngNum > 180) return { valid: false, message: 'Longitud fuera de rango (-180 a 180)' }
  return { valid: true, lat: latNum, lng: lngNum }
}

export default {
  COLOR_OPTIONS,
  getColorOption,
  getMarkerIcon,
  refreshMarkers,
  validateClientCoordinates
}
