import React, { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { AlertTriangle, CheckCircle2, Info, PencilLine, Plus, Trash2, X } from 'lucide-react'

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

const refreshMarkers = (addrs, layer, isAdminUser) => {
  if (!layer) return
  layer.clearLayers()
  addrs.forEach(addr => {
    try {
      const markerColor = getColorOption(addr.color).value
      const marker = L.marker([parseFloat(addr.lat), parseFloat(addr.lng)], {
        icon: getMarkerIcon(markerColor)
      })

      const popup = document.createElement('div')
      popup.style.minWidth = '180px'

      const title = document.createElement('strong')
      title.textContent = addr.label
      popup.appendChild(title)

      const coordinatesInfo = document.createElement('div')
      coordinatesInfo.style.marginTop = '4px'
      coordinatesInfo.style.fontSize = '12px'
      coordinatesInfo.style.color = '#666'
      coordinatesInfo.textContent = `Latitud: ${Number(addr.lat).toFixed(6)} | Longitud: ${Number(addr.lng).toFixed(6)}`
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
  const [notification, setNotification] = useState(null)
  const notificationTimerRef = useRef(null)
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

  const showNotification = useCallback((type, title, message) => {
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current)

    setNotification({ type, title, message })
    notificationTimerRef.current = setTimeout(() => {
      setNotification(null)
      notificationTimerRef.current = null
    }, 3200)
  }, [])

  const closeNotification = () => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current)
      notificationTimerRef.current = null
    }
    setNotification(null)
  }

  const openEditModal = useCallback((addr) => {
    setEditingAddress(addr)
    setEditingLabel(addr.label)
    setEditModalVisible(true)
  }, [])

  const closeEditModal = useCallback(() => {
    setEditModalVisible(false)
    setEditingAddress(null)
    setEditingLabel('')
  }, [])

  const openDeleteModal = useCallback((id) => {
    setDeletingAddressId(id)
    setDeleteModalVisible(true)
  }, [])

  const closeDeleteModal = useCallback(() => {
    setDeleteModalVisible(false)
    setDeletingAddressId(null)
  }, [])

  // Llamadas API
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
  }, [token, markersLayer, isAdmin])

  const handleUpdateAddress = useCallback(async () => {
    if (!editingAddress) return

    const trimmedLabel = editingLabel.trim()
    if (!trimmedLabel) {
      showNotification('warning', 'Nombre requerido', 'Escribe un nombre antes de guardar los cambios.')
      return
    }

    try {
      const coordCheck = validateClientCoordinates(editingAddress.lat, editingAddress.lng)
      if (!coordCheck.valid) {
        showNotification('error', 'Coordenadas inválidas', coordCheck.message)
        return
      }

      const res = await fetch(`${API_BASE}/api/addresses/${editingAddress.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          label: trimmedLabel,
          lat: coordCheck.lat,
          lng: coordCheck.lng
        })
      })

      if (!res.ok) throw new Error('No se pudo actualizar la dirección')

      closeEditModal()
      showNotification('success', 'Ubicación actualizada', 'El mensaje cambió y los datos quedaron guardados.')
      await loadAddresses()
    } catch (err) {
      showNotification('error', 'Error al actualizar', err.message)
    }
  }, [API_BASE, closeEditModal, editingAddress, editingLabel, loadAddresses, showNotification, token])

  const handleDeleteAddress = useCallback(async () => {
    if (!deletingAddressId) return

    try {
      const res = await fetch(`${API_BASE}/api/addresses/${deletingAddressId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) throw new Error('No se pudo eliminar la dirección')

      closeDeleteModal()
      showNotification('success', 'Ubicación eliminada', 'La ubicación ya no aparece en el mapa.')
      await loadAddresses()
    } catch (err) {
      showNotification('error', 'Error al eliminar', err.message)
    }
  }, [API_BASE, closeDeleteModal, deletingAddressId, loadAddresses, showNotification, token])

  const handleSubmitLocation = async () => {
    if (!modalLabel.trim()) {
      showNotification('warning', 'Nombre requerido', 'Escribe un nombre para guardar la ubicación.')
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
      showNotification('success', 'Ubicación creada', 'El mensaje cambió y la ubicación quedó registrada.')
      await loadAddresses()
    } catch (err) {
      showNotification('error', 'Error al guardar', err.message)
    }
  }

  // Funciones globales para editar y eliminar
  useEffect(() => {
    window.editAddress = async (id) => {
      const addr = addresses.find(a => a.id === id)
      if (!addr) {
        showNotification('error', 'Dirección no encontrada', 'No pudimos localizar esa ubicación.')
        return
      }

      openEditModal(addr)
    }

    window.deleteAddress = async (id) => {
      openDeleteModal(id)
    }

    return () => {
      delete window.editAddress
      delete window.deleteAddress
    }
  }, [addresses, openEditModal, openDeleteModal, showNotification])

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
        showNotification('error', 'Coordenadas inválidas', coordCheck.message)
        return
      }


      setPendingLocation({ lat: coordCheck.lat, lng: coordCheck.lng })
      setModalLabel('')
      setModalVisible(true)
    }

    map.on('click', handleMapClick)

    return () => {
      map.off('click', handleMapClick)
    }
  }, [map, adding, isAdmin, showNotification])

  // Cargar direcciones al montar y cuando el mapa esté listo
  useEffect(() => {
    if (markersLayer) {
      loadAddresses()
    }
  }, [markersLayer, loadAddresses])

  return (
    <div style={{
      padding: '0px',
      background: 'transparent'
    }}>
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 2000,
          width: 'min(92vw, 360px)',
          borderRadius: '16px',
          padding: '14px 16px',
          background: notification.type === 'success'
            ? 'linear-gradient(135deg, rgba(237, 247, 237, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%)'
            : notification.type === 'warning'
              ? 'linear-gradient(135deg, rgba(255, 248, 225, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(254, 242, 242, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%)',
          border: notification.type === 'success'
            ? '1px solid rgba(76, 175, 80, 0.22)'
            : notification.type === 'warning'
              ? '1px solid rgba(245, 158, 11, 0.25)'
              : '1px solid rgba(239, 68, 68, 0.25)',
          boxShadow: '0 18px 50px rgba(15, 23, 42, 0.18)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: notification.type === 'success'
              ? 'rgba(76, 175, 80, 0.14)'
              : notification.type === 'warning'
                ? 'rgba(245, 158, 11, 0.14)'
                : 'rgba(239, 68, 68, 0.14)',
            color: notification.type === 'success'
              ? '#2e7d32'
              : notification.type === 'warning'
                ? '#b45309'
                : '#b91c1c'
          }}>
            {notification.type === 'success' ? <CheckCircle2 size={20} /> : notification.type === 'warning' ? <AlertTriangle size={20} /> : <Info size={20} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <strong style={{ fontSize: '14px', color: '#10213a' }}>{notification.title}</strong>
              <button
                onClick={closeNotification}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                aria-label="Cerrar notificación"
              >
                <X size={16} />
              </button>
            </div>
            <p style={{ marginTop: '4px', fontSize: '13px', lineHeight: 1.4, color: '#475569' }}>
              {notification.message}
            </p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(290px, 360px) 1fr',
          gap: '16px',
          alignItems: 'start'
        }}>
          <aside style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(0, 71, 133, 0.08)',
            borderRadius: '20px',
            padding: '18px',
            boxShadow: '0 16px 50px rgba(15, 23, 42, 0.08)',
            position: 'sticky',
            top: '16px'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                borderRadius: '999px',
                background: 'rgba(0, 71, 133, 0.08)',
                color: '#004785',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}>
                Mapa operativo
              </div>
              <h1 style={{ margin: 0, fontSize: '24px', color: '#10213a', lineHeight: 1.15 }}>Ubicaciones importantes</h1>
              <p style={{ margin: '10px 0 0', color: '#607086', fontSize: '14px', lineHeight: 1.5 }}>
                Administra puntos de interés para para los voluntarios.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <button
                onClick={onBack}
                style={{
                  padding: '11px 14px',
                  background: '#667085',
                  color: 'white',
                  border: 'none',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                ← Volver
              </button>

              {isAdmin && (
                <button
                  onClick={() => setAdding(!adding)}
                  style={{
                    padding: '11px 14px',
                    background: adding ? '#ef5350' : 'linear-gradient(135deg, #004785 0%, #1d6fbf 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '18px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 700,
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Plus size={16} />
                  {adding ? 'Cancelar creación' : 'Añadir ubicación'}
                </button>
              )}

              <button
                onClick={() => map?.locate({ setView: true, maxZoom: 16 })}
                style={{
                  padding: '11px 14px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700
                }}
              >
                Mi ubicación
              </button>

              <button
                onClick={loadAddresses}
                disabled={loading}
                style={{
                  padding: '11px 14px',
                  background: loading ? '#cbd5e1' : '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '18px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 700
                }}
              >
                {loading ? 'Cargando...' : 'Actualizar'}
              </button>
            </div>

            {error && (
              <div style={{
                background: '#fef2f2',
                color: '#b91c1c',
                padding: '12px 14px',
                borderRadius: '12px',
                fontSize: '13px',
                border: '1px solid rgba(239, 68, 68, 0.16)',
                marginBottom: '12px'
              }}>
                {error}
              </div>
            )}

            {adding && (
              <div style={{
                background: '#fff7e6',
                color: '#8a5b00',
                padding: '12px 14px',
                borderRadius: '12px',
                fontSize: '13px',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                marginBottom: '16px'
              }}>
                Haz clic en el mapa para agregar una nueva ubicación con el color seleccionado.
              </div>
            )}

            {isAdmin && adding && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#24364a', marginBottom: '10px' }}>Color de punto</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {COLOR_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedColor(option.value)}
                      style={{
                        padding: '9px 11px',
                        borderRadius: '999px',
                        border: selectedColor === option.value ? '2px solid #10213a' : '1px solid rgba(15, 23, 42, 0.18)',
                        background: option.hex,
                        color: option.value === 'yellow' ? '#10213a' : 'white',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e5eaf0',
              borderRadius: '16px',
              padding: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong style={{ fontSize: '14px', color: '#10213a' }}>Leyenda</strong>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{addresses.length} puntos</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {COLOR_OPTIONS.map(option => (
                  <div key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: option.hex, display: 'inline-block', border: '1px solid rgba(0,0,0,0.15)' }} />
                    <span><strong>{option.description}</strong></span>
                  </div>
                ))}
              </div>
              {!isAdmin && (
                <p style={{ margin: '10px 0 0', fontSize: '12px', color: '#6b7280', lineHeight: 1.45 }}>
                  Cada color representa una categoría diferente de ubicación.
                </p>
              )}
            </div>

            <div style={{
              marginTop: '14px',
              padding: '12px 14px',
              background: 'rgba(0, 71, 133, 0.05)',
              borderRadius: '14px',
              fontSize: '13px',
              color: '#42566b'
            }}>
              <strong style={{ display: 'block', color: '#10213a', marginBottom: '4px' }}>Ubicaciones registradas</strong>
              {addresses.length} elementos activos en el mapa.
            </div>
          </aside>

          <main style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid rgba(0, 71, 133, 0.08)',
              borderRadius: '20px',
              padding: '14px',
              boxShadow: '0 16px 50px rgba(15, 23, 42, 0.08)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '12px',
                alignItems: 'center',
                marginBottom: '12px',
                flexWrap: 'wrap'
              }}>
                <div>
                  <h2 style={{
                    margin: 0,
                    fontSize: '18px', color: '#10213a'
                  }}>
                    Mapa interactivo
                  </h2>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '13px',
                    color: '#64748b'
                  }}>
                    {isAdmin ? 'Los puntos se editan desde el mapa.' : 'Actualiza para ver nuevos puntos en el  mapa.'}
                  </p>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#475569',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  padding: '8px 12px',
                  borderRadius: '999px'
                }}>
                  {isAdmin ? 'Modo administrador ' : 'Ubicación en tiempo real'}
                </div>
              </div>

              <div
                ref={mapRef}
                style={{
                  width: '100%',
                  height: '68vh',
                  minHeight: '560px',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 0 0 1px rgba(15, 23, 42, 0.06)'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
              color: '#64748b',
              fontSize: '12px',
              padding: '0 4px'
            }}>
              <span>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors</span>
              <span>Los cambios se reflejan en tiempo real al actualizar la lista.</span>
            </div>
          </main>
        </div>
      </div>

      {/* Modal para agregar ubicación */}
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

            <div style={{ marginBottom: '14px' }}>
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
                  background: ' #1d6fbf 100%',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              ><PencilLine size={14} />
                Guardar ubicación
              </button>
            </div>
          </div>
        </div>
      )}

      {editModalVisible && editingAddress && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(7, 14, 25, 0.56)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
            borderRadius: '18px',
            padding: '24px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.28)',
            border: '1px solid rgba(0, 71, 133, 0.12)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'start' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#000000' }}>Editar ubicación</h2>
                <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#61738b' }}>
                  Cambia solo el texto del mensaje visual.
                </p>
              </div>
              <button
                onClick={closeEditModal}
                style={{
                  border: 'none',
                  background: '#eef3f8',
                  color: '#38506a',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Cerrar edición"
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ marginTop: '18px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 700, color: '#29435c' }}>
                Nombre de la ubicació
              </label>
              <input
                type="text"
                value={editingLabel}
                onChange={(e) => setEditingLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateAddress()}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #d7e2ec',
                  borderRadius: '10px',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#fff'
                }}
                autoFocus
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
              <button
                onClick={closeEditModal}
                style={{
                  padding: '10px 16px',
                  background: '#eef3f8',
                  color: '#29435c',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateAddress}
                style={{
                  padding: '10px 16px',
                  background: ' #1d6fbf 100%',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <PencilLine size={16} />
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalVisible && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(7, 14, 25, 0.56)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #fff7f7 100%)',
            borderRadius: '18px',
            padding: '24px',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.28)',
            border: '1px solid rgba(239, 68, 68, 0.15)'
          }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#b91c1c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Trash2 size={20} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', color: '#8a1f1f' }}>Eliminar ubicación</h2>
                <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#7b5a5a', lineHeight: 1.45 }}>
                  Esta acción quitará la ubicación del mapa.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
              <button
                onClick={closeDeleteModal}
                style={{
                  padding: '10px 16px',
                  background: '#eef3f8',
                  color: '#29435c',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAddress}
                style={{
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapPage

