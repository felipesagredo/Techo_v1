import React, { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Plus } from 'lucide-react'

const COLOR_OPTIONS = [
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

const getColorOption = (color) => COLOR_OPTIONS.find(option => option.value === color) || COLOR_OPTIONS[0]

const getMarkerIcon = (color) => {
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

const MapPage = ({ onBack }) => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [markersLayer, setMarkersLayer] = useState(null)
  const [adding, setAdding] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedColor, setSelectedColor] = useState('red')
  const [modalVisible, setModalVisible] = useState(false)
  const [modalLabel, setModalLabel] = useState('')
  const [pendingLocation, setPendingLocation] = useState(null)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deletingAddressId, setDeletingAddressId] = useState(null)
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isAdmin = user && user.role_id === 1
  const token = localStorage.getItem('token')

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

  const validateClientCoordinates = (lat, lng) => {
    const latNum = Number(lat)
    const lngNum = Number(lng)
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return { valid: false, message: 'Latitud y longitud inválidas' }
    }
    if (latNum < -90 || latNum > 90) return { valid: false, message: 'Latitud fuera de rango (-90 a 90)' }
    if (lngNum < -180 || lngNum > 180) return { valid: false, message: 'Longitud fuera de rango (-180 a 180)' }
    return { valid: true, lat: latNum, lng: lngNum }
  }

  // Actualizar marcadores en el mapa
  const refreshMarkers = useCallback((addrs, layer, isAdminUser) => {
    if (!layer) return
    layer.clearLayers()
    addrs.forEach(addr => {
      try {
        const markerColor = getColorOption(addr.color).value
        const marker = L.marker([parseFloat(addr.lat), parseFloat(addr.lng)], {
          icon: getMarkerIcon(markerColor)
        })

        // Armo el popup con nodos DOM para evitar HTML en string y onclick inline.
        const popup = document.createElement('div')
        popup.style.minWidth = '150px'

        const title = document.createElement('strong')
        title.textContent = addr.label
        popup.appendChild(title)

        const colorInfo = document.createElement('div')
        colorInfo.style.marginTop = '4px'
        colorInfo.style.fontSize = '12px'
        colorInfo.style.color = '#666'
        colorInfo.textContent = `Color: ${getColorOption(markerColor).label}`
        popup.appendChild(colorInfo)

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
          editButton.addEventListener('click', () => window.editAddress(addr.id))

          const deleteButton = document.createElement('button')
          deleteButton.textContent = 'Eliminar'
          deleteButton.style.padding = '4px 8px'
          deleteButton.style.background = '#f44336'
          deleteButton.style.color = 'white'
          deleteButton.style.border = 'none'
          deleteButton.style.borderRadius = '4px'
          deleteButton.style.cursor = 'pointer'
          deleteButton.style.fontSize = '12px'
          deleteButton.addEventListener('click', () => window.deleteAddress(addr.id))

          actions.appendChild(editButton)
          actions.appendChild(deleteButton)
          popup.appendChild(actions)
        }

        marker.bindPopup(popup)
        layer.addLayer(marker)
      } catch (err) {
        console.error('Error añadiendo marcador:', err)
      }
    })
  }, [])

  // Cargar direcciones desde API
  const loadAddresses = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/addresses`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      if (!res.ok) throw new Error('Error cargando direcciones')
      const data = await res.json()
      setAddresses(data.addresses || [])
      if (markersLayer) {
        refreshMarkers(data.addresses || [], markersLayer, isAdmin)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Error al cargar las direcciones')
    } finally {
      setLoading(false)
    }
  }, [token, markersLayer, refreshMarkers, isAdmin])

  // Funciones globales para editar y eliminar
  useEffect(() => {
    window.editAddress = async (id) => {
      const addr = addresses.find(a => a.id === id)
      if (!addr) {
        alert('Dirección no encontrada')
        return
      }
      
      const newLabel = window.prompt('Nuevo nombre:', addr.label)
      if (!newLabel || newLabel === addr.label) return

      try {
        // Normalizar y validar coordenadas antes de enviar
        const coordCheck = validateClientCoordinates(addr.lat, addr.lng)
        if (!coordCheck.valid) {
          alert(coordCheck.message)
          return
        }

        const res = await fetch(`${API_BASE}/api/addresses/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            label: newLabel,
            lat: coordCheck.lat,
            lng: coordCheck.lng
          })
        })
        if (!res.ok) throw new Error('Error actualizando')
        alert('Dirección actualizada')
        await loadAddresses()
      } catch (err) {
        alert('Error: ' + err.message)
      }
    }

    window.deleteAddress = async (id) => {
      if (!window.confirm('¿Estás seguro de eliminar esta dirección?')) return

      try {
        const res = await fetch(`${API_BASE}/api/addresses/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!res.ok) throw new Error('Error eliminando')
        alert('Dirección eliminada')
        await loadAddresses()
      } catch (err) {
        alert('Error: ' + err.message)
      }
    }

    return () => {
      delete window.editAddress
      delete window.deleteAddress
    }
  }, [addresses, token, loadAddresses])

  // Inicializar mapa - solo una vez
  useEffect(() => {
    if (!mapRef.current || map) return

    try {
      const m = L.map(mapRef.current).setView([-33.45, -70.6667], 9)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(m)

      const layer = L.layerGroup().addTo(m)
      setMarkersLayer(layer)
      setMap(m)

      // Geolocalización del usuario
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude, longitude } = pos.coords
          const userMarker = L.marker([latitude, longitude], {
            title: 'Tu ubicación',
            icon: getMarkerIcon('blue')
          })
          userMarker.bindPopup('Tu ubicación actual')
          userMarker.addTo(m)
        }, (error) => {
          console.log('Geolocalización no disponible:', error)
        })
      }

      // Cleanup - eliminar mapa al desmontar
      return () => {
        m.remove()
      }
    } catch (err) {
      console.error('Error inicializando mapa:', err)
      setError('Error al inicializar el mapa')
    }
  }, [])

  // Manejar click para agregar marcador
  useEffect(() => {
    if (!map) return

    const handleMapClick = async (e) => {
      if (!adding || !isAdmin) return
      const { lat, lng } = e.latlng
      
      // Validar coordenadas en cliente
      const coordCheck = validateClientCoordinates(lat, lng)
      if (!coordCheck.valid) {
        alert(coordCheck.message)
        return
      }

      // Abrir modal en lugar de prompt
      setPendingLocation({ lat: coordCheck.lat, lng: coordCheck.lng })
      setModalLabel('')
      setModalVisible(true)
    }

    map.on('click', handleMapClick)

    return () => {
      map.off('click', handleMapClick)
    }
  }, [map, adding, isAdmin])

  // Manejar envío del formulario modal
  const handleSubmitLocation = async () => {
    if (!modalLabel.trim()) {
      alert('Por favor ingresa un nombre')
      return
    }

    try {
      const color = isAdmin ? selectedColor : 'red'
      const res = await fetch(`${API_BASE}/api/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          label: modalLabel.trim(), 
          lat: pendingLocation.lat, 
          lng: pendingLocation.lng, 
          color 
        })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error guardando')
      }
      setAdding(false)
      setModalVisible(false)
      setModalLabel('')
      setPendingLocation(null)
      alert('Ubicación guardada correctamente')
      await loadAddresses()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  // Cargar direcciones al montar y cuando el mapa esté listo
  useEffect(() => {
    if (markersLayer) {
      loadAddresses()
    }
  }, [markersLayer, loadAddresses])

  return (
    <div style={{ padding: '16px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={onBack}
            style={{
              padding: '10px 16px',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Volver
          </button>
          
          {isAdmin && (
            <button 
              onClick={() => setAdding(!adding)}
              style={{
                padding: '10px 16px',
                background: adding ? '#ff6b6b' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                gap: '4px',
                alignItems: 'center'
              }}
            >
              <Plus size={16} />
              {adding ? 'Cancelar' : 'Añadir Ubicación'}
            </button>
          )}

          {isAdmin && adding && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#f5f5f5', borderRadius: '6px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Color:</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {COLOR_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedColor(option.value)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '999px',
                      border: selectedColor === option.value ? '2px solid #111' : '1px solid #ccc',
                      background: option.hex,
                      color: option.value === 'yellow' ? '#111' : 'white',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={() => map?.locate({ setView: true, maxZoom: 16 })}
            style={{
              padding: '10px 16px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Mi Ubicación
          </button>

          <button 
            onClick={loadAddresses}
            disabled={loading}
            style={{
              padding: '10px 16px',
              background: loading ? '#ccc' : '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {error && (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        {adding && (
          <div style={{
            background: '#fff3cd',
            color: '#856404',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '13px'
          }}>
            Haz clic en el mapa para agregar una nueva ubicación con el color seleccionado
          </div>
        )}
      </div>

      {/* Mapa */}
      <div 
        ref={mapRef} 
        style={{ 
          flex: 1,
          borderRadius: '8px', 
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }} 
      />

      <div style={{ marginTop: '10px', padding: '10px 12px', background: '#fafafa', border: '1px solid #eee', borderRadius: '8px' }}>
        <strong style={{ display: 'block', marginBottom: '8px' }}>Categorías de ubicaciones</strong>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {COLOR_OPTIONS.map(option => (
            <div key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: option.hex, display: 'inline-block', border: '1px solid rgba(0,0,0,0.15)' }} />
              <span><strong>{option.description}</strong></span>
            </div>
          ))}
        </div>
        {!isAdmin && (
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#666' }}>
            Cada color representa una categoría diferente de ubicación.
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '12px',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center'
      }}>
        <p style={{ margin: '4px 0' }}>
          Ubicaciones registradas: <strong>{addresses.length}</strong>
        </p>
        <p style={{ margin: '4px 0', fontSize: '11px' }}>
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors
        </p>
      </div>

      {/* Modal amigable para agregar ubicación */}
      {modalVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#333' }}>
              Nueva ubicación
            </h2>
            
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
              Categoria: <strong>{getColorOption(selectedColor).description}</strong>
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                Nombre de la ubicación:
              </label>
              <input
                type="text"
                value={modalLabel}
                onChange={(e) => setModalLabel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitLocation()}
                placeholder="Ej: Centro comunitario..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setModalVisible(false)
                  setModalLabel('')
                  setPendingLocation(null)
                }}
                style={{
                  padding: '10px 16px',
                  background: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitLocation}
                style={{
                  padding: '10px 16px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Guardar ubicación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapPage

