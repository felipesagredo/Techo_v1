import React, { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Plus } from 'lucide-react'

const MapPage = ({ onBack }) => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [markersLayer, setMarkersLayer] = useState(null)
  const [adding, setAdding] = useState(false)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isAdmin = user && user.role_id === 1
  const token = localStorage.getItem('token')

  // Actualizar marcadores en el mapa
  const refreshMarkers = useCallback((addrs, layer, isAdminUser) => {
    if (!layer) return
    layer.clearLayers()
    addrs.forEach(addr => {
      try {
        const marker = L.marker([parseFloat(addr.lat), parseFloat(addr.lng)])
        const popupContent = isAdminUser 
          ? `<div style="min-width: 150px">
               <strong>${addr.label}</strong>
               <div style="margin-top: 8px; display: 'flex'; gap: 4px">
                 <button onclick="window.editAddress(${addr.id})" style="padding: 4px 8px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px">Editar</button>
                 <button onclick="window.deleteAddress(${addr.id})" style="padding: 4px 8px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px">Eliminar</button>
               </div>
             </div>`
          : `<strong>${addr.label}</strong>`
        marker.bindPopup(popupContent)
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
      const res = await fetch('http://localhost:5000/api/addresses', {
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
        const res = await fetch(`http://localhost:5000/api/addresses/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            label: newLabel,
            lat: addr.lat,
            lng: addr.lng
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
        const res = await fetch(`http://localhost:5000/api/addresses/${id}`, {
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
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
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
      const label = window.prompt('Nombre de esta dirección:')
      if (!label || label.trim() === '') return

      try {
        const res = await fetch('http://localhost:5000/api/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ label: label.trim(), lat, lng })
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Error guardando')
        }
        setAdding(false)
        alert('Marcador guardado')
        await loadAddresses()
      } catch (err) {
        alert('Error: ' + err.message)
      }
    }

    map.on('click', handleMapClick)

    return () => {
      map.off('click', handleMapClick)
    }
  }, [map, adding, isAdmin, token])

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
            📍 Mi Ubicación
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
            {loading ? 'Cargando...' : '🔄 Actualizar'}
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
            ⚠️ {error}
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
            ℹ️ Haz clic en el mapa para agregar una nueva ubicación
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

      {/* Footer */}
      <div style={{
        marginTop: '12px',
        fontSize: '12px',
        color: '#666',
        textAlign: 'center'
      }}>
        <p style={{ margin: '4px 0' }}>
          📍 Ubicaciones registradas: <strong>{addresses.length}</strong>
        </p>
        <p style={{ margin: '4px 0', fontSize: '11px' }}>
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors
        </p>
      </div>
    </div>
  )
}

export default MapPage

