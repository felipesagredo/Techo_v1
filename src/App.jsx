import React, { useState, useEffect } from 'react'
import {
  Mail,
  Lock,
  Users,
  ArrowRight,
  Home,
  LayoutDashboard,
  Package,
  Wrench,
  LogOut,
  Search,
  Bell,
  Settings,
  AlertTriangle,
  ChevronRight,
  MapPin,
  Calendar,
  ClipboardList,
  Utensils,
  Eye,
  Edit2,
  Plus,
  X
} from 'lucide-react'

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [mode, setMode] = useState('login')
  const [currentView, setCurrentView] = useState('dashboard')
  const [cuadrillasList, setCuadrillasList] = useState([])
  const [loadingCuadrillas, setLoadingCuadrillas] = useState(false)

  // Modals state
  const [showNewCuadrillaModal, setShowNewCuadrillaModal] = useState(false)
  const [newCuadrillaData, setNewCuadrillaData] = useState({ nombre: '', zona: '' })
  const [creatingCuadrilla, setCreatingCuadrilla] = useState(false)

  // Assign Modal state
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedCuadrilla, setSelectedCuadrilla] = useState(null)
  const [usersList, setUsersList] = useState([])
  const [rolesList, setRolesList] = useState([])
  const [currentMembers, setCurrentMembers] = useState([])
  const [assignData, setAssignData] = useState({ userId: '', rolCuadrillaId: '' })
  const [assigningMember, setAssigningMember] = useState(false)

  // View Members Modal state
  const [showViewMembersModal, setShowViewMembersModal] = useState(false)

  // Herramientas & Materiales state
  const [herramientasList, setHerramientasList] = useState([])
  const [materialesList, setMaterialesList] = useState([])
  const [loadingInventario, setLoadingInventario] = useState(false)
  
  // Herramientas/Materiales Modals
  const [showCreateItemModal, setShowCreateItemModal] = useState(false)
  const [showEditItemModal, setShowEditItemModal] = useState(false)
  const [itemType, setItemType] = useState('herramienta') // 'herramienta' | 'material'
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', cantidad: '', estado: 'bueno', responsable: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (user && currentView === 'cuadrillas') {
      setLoadingCuadrillas(true)
      fetch('http://localhost:5000/api/cuadrillas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setCuadrillasList(data)
          setLoadingCuadrillas(false)
        })
        .catch(err => {
          console.error(err)
          setLoadingCuadrillas(false)
        })
    }
  }, [user, currentView])

  useEffect(() => {
    if (user && currentView === 'herramientas') {
      setLoadingInventario(true)
      Promise.all([
        fetch('http://localhost:5000/api/herramientas', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json()),
        fetch('http://localhost:5000/api/materiales', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json())
      ])
        .then(([herramientas, materiales]) => {
          setHerramientasList(herramientas)
          setMaterialesList(materiales)
          setLoadingInventario(false)
        })
        .catch(err => {
          console.error(err)
          setLoadingInventario(false)
        })
    }
  }, [user, currentView])

  const handleCreateCuadrilla = async (e) => {
    e.preventDefault();
    setCreatingCuadrilla(true);
    try {
      const response = await fetch('http://localhost:5000/api/cuadrillas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newCuadrillaData)
      });
      if (response.ok) {
        // Fetch again to get updated list with count 0 and no capataz
        const fetchRes = await fetch('http://localhost:5000/api/cuadrillas');
        const data = await fetchRes.json();
        setCuadrillasList(data);
        setShowNewCuadrillaModal(false);
        setNewCuadrillaData({ nombre: '', zona: '' });
      } else {
        alert('Error al crear cuadrilla');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al crear cuadrilla');
    } finally {
      setCreatingCuadrilla(false);
    }
  };

  const handleOpenAssignModal = async (cuadrilla) => {
    setSelectedCuadrilla(cuadrilla);
    setShowAssignModal(true);
    
    try {
      const [membersRes, usersRes, rolesRes] = await Promise.all([
        fetch(`http://localhost:5000/api/cuadrillas/${cuadrilla.id}/miembros`),
        fetch(`http://localhost:5000/api/users`),
        fetch(`http://localhost:5000/api/cuadrillas/roles`)
      ]);
      
      const membersData = await membersRes.json();
      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();
      
      setCurrentMembers(membersData);
      setUsersList(usersData);
      setRolesList(rolesData);
      if (usersData.length > 0 && rolesData.length > 0) {
        setAssignData({ userId: usersData[0].id, rolCuadrillaId: rolesData[0].id });
      }
    } catch (err) {
      console.error(err);
      alert('Error cargando datos de asignación');
    }
  };

  const handleOpenViewMembersModal = async (cuadrilla) => {
    setSelectedCuadrilla(cuadrilla);
    setShowViewMembersModal(true);
    
    try {
      const membersRes = await fetch(`http://localhost:5000/api/cuadrillas/${cuadrilla.id}/miembros`);
      const membersData = await membersRes.json();
      setCurrentMembers(membersData);
    } catch (err) {
      console.error(err);
      alert('Error cargando miembros');
    }
  };

  const handleAssignMember = async (e) => {
    e.preventDefault();
    if (!assignData.userId || !assignData.rolCuadrillaId) return;
    
    setAssigningMember(true);
    try {
      const response = await fetch('http://localhost:5000/api/cuadrillas/add-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: Number(assignData.userId),
          cuadrillaId: selectedCuadrilla.id,
          rolCuadrillaId: Number(assignData.rolCuadrillaId)
        })
      });
      
      if (response.ok) {
        const membersRes = await fetch(`http://localhost:5000/api/cuadrillas/${selectedCuadrilla.id}/miembros`);
        setCurrentMembers(await membersRes.json());
      } else {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.error || 'El voluntario ya está asignado a esta cuadrilla o hubo un error.');
      }
    } catch(err) {
       console.error(err);
       alert('Error de conexión al asignar voluntario.');
    } finally {
       setAssigningMember(false);
    }
  };

  const handleCloseAssignModal = async () => {
    setShowAssignModal(false);
    setSelectedCuadrilla(null);
    const fetchRes = await fetch('http://localhost:5000/api/cuadrillas');
    const data = await fetchRes.json();
    setCuadrillasList(data);
  };

  // Handlers for Herramientas/Materiales CRUD
  const handleOpenCreateModal = (type) => {
    setItemType(type)
    setFormData({ nombre: '', descripcion: '', cantidad: '', estado: 'bueno', responsable: '' })
    setSelectedItem(null)
    setShowCreateItemModal(true)
  }

  const handleOpenEditModal = (item, type) => {
    setItemType(type)
    setSelectedItem(item)
    setFormData({
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      cantidad: item.cantidad || '',
      estado: item.estado || 'bueno',
      responsable: item.responsable || ''
    })
    setShowEditItemModal(true)
  }

  const handleCreateItem = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const endpoint = itemType === 'herramienta' ? '/api/herramientas' : '/api/materiales'
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        alert(`${itemType === 'herramienta' ? 'Herramienta' : 'Material'} creado exitosamente`)
        setShowCreateItemModal(false)
        // Reload inventory
        const [herramientas, materiales] = await Promise.all([
          fetch('http://localhost:5000/api/herramientas').then(r => r.json()),
          fetch('http://localhost:5000/api/materiales').then(r => r.json())
        ])
        setHerramientasList(herramientas)
        setMaterialesList(materiales)
      } else {
        alert('Error al crear item')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditItem = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const endpoint = itemType === 'herramienta' ? `/api/herramientas/${selectedItem.id}` : `/api/materiales/${selectedItem.id}`
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        alert(`${itemType === 'herramienta' ? 'Herramienta' : 'Material'} actualizado exitosamente`)
        setShowEditItemModal(false)
        // Reload inventory
        const [herramientas, materiales] = await Promise.all([
          fetch('http://localhost:5000/api/herramientas').then(r => r.json()),
          fetch('http://localhost:5000/api/materiales').then(r => r.json())
        ])
        setHerramientasList(herramientas)
        setMaterialesList(materiales)
      } else {
        alert('Error al actualizar item')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteItem = async (id, type) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar este ${type === 'herramienta' ? 'herramienta' : 'material'}?`)) return
    
    const endpoint = type === 'herramienta' ? `/api/herramientas/${id}` : `/api/materiales/${id}`
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        alert(`${type === 'herramienta' ? 'Herramienta' : 'Material'} eliminado exitosamente`)
        // Reload inventory
        const [herramientas, materiales] = await Promise.all([
          fetch('http://localhost:5000/api/herramientas').then(r => r.json()),
          fetch('http://localhost:5000/api/materiales').then(r => r.json())
        ])
        setHerramientasList(herramientas)
        setMaterialesList(materiales)
      } else {
        alert('Error al eliminar item')
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión')
    }
  }

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const endpoint = mode === 'login' ? '/api/login' : '/api/register'
    const body = mode === 'login'
      ? { email, password }
      : { name, email, password }

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        if (mode === 'register') {
          alert('¡Registro exitoso! Ahora puedes iniciar sesión.')
          setMode('login')
          setName('')
        } else {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          setUser(data.user)
          alert('¡Bienvenido, ' + data.user.name + '!')
        }
      } else {
        setError(data.error || 'Ocurrió un error')
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor. ¿Está encendido?')
    } finally {
      setLoading(false)
    }
  }

  // Si el usuario está logueado, mostrar Dashboard
  if (user) {
    return (
      <div className="dashboard-layout">
        {/* Top Navigation */}
        <header className="top-nav">
          <div className="top-nav-left">
            <div className="top-nav-logo">
              <h2>TECHO <span>Gestión</span></h2>
            </div>
            <nav className="top-nav-links">
              <a href="#" className="active">Resumen</a>
              <a href="#">Reportes</a>
              <a href="#">Geolocalización</a>
            </nav>
          </div>
          <div className="top-nav-right">
            <div className="search-bar">
              <Search size={16} />
              <input type="text" placeholder="Buscar registros..." />
            </div>
            <button className="icon-btn"><Bell size={18} /></button>
            <button className="icon-btn"><Settings size={18} /></button>
            <div className="user-avatar-small">{user.name ? user.name.charAt(0).toUpperCase() : 'T'}</div>
          </div>
        </header>

        <div className="dashboard-content-wrapper">
          {/* Sidebar */}
          <aside className="sidebar-modern">
            <div className="sidebar-profile">
              <h3>Administrador</h3>
              <p>Gestión Nacional</p>
            </div>
            <nav className="sidebar-menu">
              <a href="#" className={currentView === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); }}>
                <LayoutDashboard size={18} /> Dashboard
              </a>
              <a href="#" className={currentView === 'registro' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentView('registro'); }}>
                <ClipboardList size={18} /> Registro
              </a>
              <a href="#" className={currentView === 'cuadrillas' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentView('cuadrillas'); }}>
                <Users size={18} /> Grupos
              </a>
              <a href="#" className={currentView === 'herramientas' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentView('herramientas'); }}>
                <Wrench size={18} /> Herramientas
              </a>
              <a href="#" className={currentView === 'almuerzos' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentView('almuerzos'); }}>
                <Utensils size={18} /> Almuerzos
              </a>
            </nav>
            <div className="sidebar-bottom">
              <div className="user-profile-card">
                <div>
                  <h4>{user.name}</h4>
                  <p>Director Regional</p>
                </div>
              </div>
              <button className="logout-btn-modern" onClick={handleLogout}>
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-dashboard">
            {currentView === 'dashboard' && (
              <>
                <div className="dashboard-header">
                  <div>
                    <h1>Panel de Control</h1>
                    <p>Monitoreo en tiempo real de operaciones territoriales.</p>
                  </div>
                  <div className="header-actions">
                    <button className="btn-outline">Descargar PDF</button>
                    <button className="btn-primary">Generar Reporte Mensual</button>
                  </div>
                </div>

                {/* KPIs */}
                <div className="kpi-grid">
                  <div className="kpi-card blue">
                    <div className="kpi-header">
                      <div className="kpi-icon blue-bg"><Users size={20} /></div>
                      <span className="kpi-badge green">+12%</span>
                    </div>
                    <div className="kpi-body">
                      <p className="kpi-label">VOLUNTARIOS ACTIVOS</p>
                      <h2>1,284</h2>
                      <p className="kpi-sub">En 4 regiones activas</p>
                    </div>
                  </div>

                  <div className="kpi-card blue">
                    <div className="kpi-header">
                      <div className="kpi-icon blue-bg"><Wrench size={20} /></div>
                      <span className="kpi-badge gray">Estable</span>
                    </div>
                    <div className="kpi-body">
                      <p className="kpi-label">TOTAL HERRAMIENTAS</p>
                      <h2>4,520</h2>
                      <p className="kpi-sub">92% en buen estado</p>
                    </div>
                  </div>

                  <div className="kpi-card brown">
                    <div className="kpi-header">
                      <div className="kpi-icon brown-bg"><Users size={20} /></div>
                      <span className="kpi-badge blue">En terreno</span>
                    </div>
                    <div className="kpi-body">
                      <p className="kpi-label">CUADRILLAS ACTIVAS</p>
                      <h2>86</h2>
                      <p className="kpi-sub">Promedio: 15 pers/cuadrilla</p>
                    </div>
                  </div>

                  <div className="kpi-card red active-alert">
                    <div className="kpi-header">
                      <div className="kpi-icon red-bg"><AlertTriangle size={20} /></div>
                      <span className="kpi-badge red-solid">ALERTA</span>
                    </div>
                    <div className="kpi-body">
                      <p className="kpi-label">STOCK CRÍTICO</p>
                      <h2>4 Items</h2>
                      <p className="kpi-sub">Requiere reposición inmediata</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Grid */}
                <div className="dashboard-grid">
                  {/* Left Column */}
                  <div className="grid-left">
                    {/* Inventario */}
                    <div className="card inventory-card">
                      <div className="card-header">
                        <div>
                          <h3>Estado del Inventario</h3>
                          <p>Alimentos y logística de campaña</p>
                        </div>
                        <a href="#" className="link-action">Ver todo el almacén <ChevronRight size={16} /></a>
                      </div>
                      <div className="inventory-list">
                        <div className="inventory-item">
                          <div className="item-icon image-bg"></div>
                          <div className="item-details">
                            <h4>Arroz Grano Largo (Kg)</h4>
                            <p>ID: ALM-2024-001</p>
                          </div>
                          <div className="item-status">
                            <h4>120 Kg</h4>
                            <span className="text-red">BAJO ESTADO CRÍTICO</span>
                          </div>
                        </div>
                        <div className="inventory-item">
                          <div className="item-icon dark-bg"><Package size={20} color="white" /></div>
                          <div className="item-details">
                            <h4>Aceite Vegetal (Lts)</h4>
                            <p>ID: ALM-2024-012</p>
                          </div>
                          <div className="item-status">
                            <h4>850 Lts</h4>
                            <span className="text-green">STOCK SALUDABLE</span>
                          </div>
                        </div>
                        <div className="inventory-item">
                          <div className="item-icon dark-bg"><Wrench size={20} color="white" /></div>
                          <div className="item-details">
                            <h4>Kits de Construcción Básica</h4>
                            <p>ID: HER-2024-113</p>
                          </div>
                          <div className="item-status">
                            <h4 className="text-orange">12 Unidades</h4>
                            <span className="text-orange">EN TRÁNSITO</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cuadrillas */}
                    <div className="cuadrillas-section">
                      <div className="section-header">
                        <h3>Cuadrillas en Terreno</h3>
                        <span className="active-dot">42 activas ahora</span>
                      </div>
                      <div className="cuadrillas-grid">
                        <div className="cuadrilla-card">
                          <div className="cuadrilla-info">
                            <div className="cuadrilla-icon">C1</div>
                            <div>
                              <h4>Cuadrilla "Esperanza"</h4>
                              <p>Región del Biobío</p>
                            </div>
                          </div>
                          <div className="cuadrilla-footer">
                            <div className="avatar-group">
                              <div className="small-avatar bg-1"></div>
                              <div className="small-avatar bg-2"></div>
                              <div className="small-avatar bg-3">+12</div>
                            </div>
                            <span className="tag-blue">Fase: Orientación</span>
                          </div>
                        </div>
                        <div className="cuadrilla-card">
                          <div className="cuadrilla-info">
                            <div className="cuadrilla-icon orange">C8</div>
                            <div>
                              <h4>Cuadrilla "Maipú Sur"</h4>
                              <p>Región Metropolitana</p>
                            </div>
                          </div>
                          <div className="cuadrilla-footer">
                            <div className="avatar-group">
                              <div className="small-avatar bg-4"></div>
                              <div className="small-avatar bg-5"></div>
                              <div className="small-avatar bg-6">+8</div>
                            </div>
                            <span className="tag-light">Fase: Techado</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="grid-right">
                    {/* Map Card */}
                    <div className="card map-card">
                      <div className="map-image-placeholder">
                        <MapPin size={24} className="pin blue-pin" />
                        <MapPin size={24} className="pin red-pin" />
                      </div>
                      <div className="map-info">
                        <h4>Foco Operativo - Valparaíso</h4>
                        <p>Mayor densidad de cuadrillas hoy</p>
                        <button className="btn-outline full-width mt-1">Ver Mapa Interactivo</button>
                      </div>
                    </div>

                    {/* Hitos */}
                    <div className="card hitos-card">
                      <h3 className="hitos-title"><Calendar size={18} /> Próximos Hitos</h3>
                      <div className="hitos-list">
                        <div className="hito-item">
                          <div className="hito-date">
                            <span>OCT</span>
                            <strong>12</strong>
                          </div>
                          <div className="hito-info">
                            <h4>Campaña de Invierno 2026</h4>
                            <p>Lanzamiento nacional masivo</p>
                          </div>
                        </div>
                        <div className="hito-item">
                          <div className="hito-date">
                            <span>OCT</span>
                            <strong>15</strong>
                          </div>
                          <div className="hito-info">
                            <h4>Capacitación Jefes</h4>
                            <p>Sede Central TECHO</p>
                          </div>
                        </div>
                        <div className="hito-item disabled">
                          <div className="hito-date">
                            <span>OCT</span>
                            <strong>20</strong>
                          </div>
                          <div className="hito-info">
                            <h4>Cierre Auditoría Q3</h4>
                            <p>Reporte financiero nacional</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Did you know */}
                    <div className="card info-card-blue">
                      <h3>¿Sabías que... ?</h3>
                      <p>Este mes hemos reducido los tiempos de entrega de herramientas en un 15% gracias a la nueva gestión de cuadrillas.</p>
                      <button className="btn-white">Ver métricas</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentView === 'cuadrillas' && (
              <div className="cuadrillas-view-container">
                <div className="cv-header">
                  <div>
                    <h1>Gestión de Cuadrillas</h1>
                    <p>Supervisa y organiza los equipos de construcción en terreno. Asegura que cada cuadrilla tenga un liderazgo sólido para el cumplimiento de metas habitacionales.</p>
                  </div>
                  <button className="btn-primary" onClick={() => setShowNewCuadrillaModal(true)}>
                    <Plus size={16} /> Nueva Cuadrilla
                  </button>
                </div>

                <div className="cv-kpis">
                  <div className="cv-kpi-card">
                    <p>TOTAL EQUIPOS</p>
                    <h2>{cuadrillasList.length}</h2>
                  </div>
                  <div className="cv-kpi-card cv-kpi-red">
                    <p>SIN CAPATACES</p>
                    <h2>{cuadrillasList.filter(c => !c.capataz_nombre).length < 10 ? `0${cuadrillasList.filter(c => !c.capataz_nombre).length}` : cuadrillasList.filter(c => !c.capataz_nombre).length} <AlertTriangle size={18} /></h2>
                  </div>
                  <div className="cv-kpi-card cv-kpi-wide">
                    <div className="cv-kpi-text">
                      <p>META SEMANAL</p>
                      <h3>12 Viviendas en proceso</h3>
                    </div>
                    <div className="cv-progress-bar">
                      <div className="cv-progress-fill"></div>
                    </div>
                  </div>
                </div>

                <div className="cv-table-container">
                  <div className="cv-table-header">
                    <div className="col-equipo">EQUIPO / UBICACIÓN</div>
                    <div className="col-capataz">CAPATAZ ASIGNADO</div>
                    <div className="col-miembros">MIEMBROS</div>
                    <div className="col-estado">ESTADO</div>
                    <div className="col-acciones">ACCIONES</div>
                  </div>

                  <div className="cv-table-body">
                    {loadingCuadrillas ? <p className="loading-text">Cargando...</p> : cuadrillasList.map(cuadrilla => {
                      const noCapataz = !cuadrilla.capataz_nombre;
                      return (
                        <div key={cuadrilla.id} className={`cv-table-row ${noCapataz ? 'row-alert' : ''}`}>
                          <div className="col-equipo">
                            <div className={`cv-icon ${noCapataz ? 'icon-alert' : 'icon-normal'}`}>
                              <Home size={18} />
                            </div>
                            <div>
                              <h4>{cuadrilla.nombre}</h4>
                              <p>{cuadrilla.zona}</p>
                            </div>
                          </div>
                          <div className="col-capataz">
                            {noCapataz ? (
                              <div className="no-capataz-text"><Users size={14} /> ASIGNAR CAPATAZ</div>
                            ) : (
                              <div className="capataz-info">
                                <div className="capataz-avatar">{cuadrilla.capataz_nombre.charAt(0)}</div>
                                <div>
                                  <h4>{cuadrilla.capataz_nombre}</h4>
                                  <p>{cuadrilla.capataz_rol}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="col-miembros">
                            <span className={`miembros-number ${noCapataz ? 'text-red' : 'text-blue'}`}>{cuadrilla.miembros_count < 10 ? `0${cuadrilla.miembros_count}` : cuadrilla.miembros_count}</span>
                          </div>
                          <div className="col-estado">
                            <span className={`cv-badge badge-${cuadrilla.estado.toLowerCase().replace(/\s/g, '-')}`}>{cuadrilla.estado}</span>
                          </div>
                          <div className="col-acciones">
                            {noCapataz ? (
                              <div className="alert-actions">
                                <button className="btn-priorizar" onClick={() => handleOpenAssignModal(cuadrilla)}>PRIORIZAR</button>
                                <div className="alert-circle">!</div>
                              </div>
                            ) : (
                              <div className="normal-actions">
                                <button className="icon-action" onClick={() => handleOpenViewMembersModal(cuadrilla)}><Eye size={16} /></button>
                                <button className="icon-action" onClick={() => handleOpenAssignModal(cuadrilla)}><Edit2 size={16} /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* HERRAMIENTAS & MATERIALES VIEW */}
            {currentView === 'herramientas' && (
              <div className="inventario-view-container">
                <div className="inventario-header">
                  <div>
                    <h1>Gestión de Herramientas y Materiales</h1>
                    <p>Administra el inventario de construcción y asigna recursos a cuadrillas.</p>
                  </div>
                  <div className="header-buttons">
                    <button className="btn-primary" onClick={() => handleOpenCreateModal('herramienta')}>
                      <Plus size={16} /> Nueva Herramienta
                    </button>
                    <button className="btn-secondary" onClick={() => handleOpenCreateModal('material')}>
                      <Plus size={16} /> Nuevo Material
                    </button>
                  </div>
                </div>

                {loadingInventario ? (
                  <div className="loading-container">
                    <p>Cargando inventario...</p>
                  </div>
                ) : (
                  <>
                    {/* Herramientas Section */}
                    <div className="inventario-section">
                      <div className="section-title">
                        <h2><Wrench size={24} /> Herramientas ({herramientasList.length})</h2>
                        <p>Herramientas técnicas de construcción en inventario</p>
                      </div>
                      <div className="items-grid">
                        {herramientasList.length === 0 ? (
                          <div className="empty-state">
                            <Wrench size={48} />
                            <p>No hay herramientas registradas</p>
                          </div>
                        ) : (
                          herramientasList.map(herr => (
                            <div key={herr.id} className="item-card">
                              <div className="item-header">
                                <div className="item-icon herramienta-icon">
                                  <Wrench size={24} />
                                </div>
                                <div className={`item-status status-${herr.estado || 'bueno'}`}>
                                  {herr.estado || 'bueno'}
                                </div>
                              </div>
                              <h3>{herr.nombre}</h3>
                              <p className="item-desc">{herr.descripcion || 'Sin descripción'}</p>
                              <div className="item-meta">
                                <div className="meta-item">
                                  <span className="meta-label">Cantidad:</span>
                                  <span className="meta-value">{herr.cantidad || 0}</span>
                                </div>
                                <div className="meta-item">
                                  <span className="meta-label">Responsable:</span>
                                  <span className="meta-value">{herr.responsable || 'N/A'}</span>
                                </div>
                              </div>
                              <div className="item-actions">
                                <button className="btn-edit" onClick={() => handleOpenEditModal(herr, 'herramienta')}>
                                  <Edit2 size={16} /> Editar
                                </button>
                                <button className="btn-delete" onClick={() => handleDeleteItem(herr.id, 'herramienta')}>
                                  X Eliminar
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Materiales Section */}
                    <div className="inventario-section">
                      <div className="section-title">
                        <h2><Package size={24} /> Materiales ({materialesList.length})</h2>
                        <p>Materiales de construcción en inventario</p>
                      </div>
                      <div className="items-grid">
                        {materialesList.length === 0 ? (
                          <div className="empty-state">
                            <Package size={48} />
                            <p>No hay materiales registrados</p>
                          </div>
                        ) : (
                          materialesList.map(mat => (
                            <div key={mat.id} className="item-card">
                              <div className="item-header">
                                <div className="item-icon material-icon">
                                  <Package size={24} />
                                </div>
                                <div className={`item-status status-${mat.estado || 'bueno'}`}>
                                  {mat.estado || 'bueno'}
                                </div>
                              </div>
                              <h3>{mat.nombre}</h3>
                              <p className="item-desc">{mat.descripcion || 'Sin descripción'}</p>
                              <div className="item-meta">
                                <div className="meta-item">
                                  <span className="meta-label">Cantidad:</span>
                                  <span className="meta-value">{mat.cantidad || 0}</span>
                                </div>
                                <div className="meta-item">
                                  <span className="meta-label">Responsable:</span>
                                  <span className="meta-value">{mat.responsable || 'N/A'}</span>
                                </div>
                              </div>
                              <div className="item-actions">
                                <button className="btn-edit" onClick={() => handleOpenEditModal(mat, 'material')}>
                                  <Edit2 size={16} /> Editar
                                </button>
                                <button className="btn-delete" onClick={() => handleDeleteItem(mat.id, 'material')}>
                                  X Eliminar
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Modal Nueva Cuadrilla */}
            {showNewCuadrillaModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2>Crear Nueva Cuadrilla</h2>
                    <button className="icon-btn" onClick={() => setShowNewCuadrillaModal(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleCreateCuadrilla}>
                    <div className="form-group">
                      <label>Nombre del Equipo</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Cuadrilla Los Pinos" 
                        value={newCuadrillaData.nombre}
                        onChange={e => setNewCuadrillaData({...newCuadrillaData, nombre: e.target.value})}
                        required
                        className="modal-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Zona / Ubicación</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Campamento Esperanza, Maipú" 
                        value={newCuadrillaData.zona}
                        onChange={e => setNewCuadrillaData({...newCuadrillaData, zona: e.target.value})}
                        required
                        className="modal-input"
                      />
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn-outline" onClick={() => setShowNewCuadrillaModal(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn-primary" disabled={creatingCuadrilla}>
                        {creatingCuadrilla ? 'Creando...' : 'Crear Cuadrilla'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Asignar Miembros (Edición) */}
            {showAssignModal && selectedCuadrilla && (
              <div className="modal-overlay">
                <div className="modal-content assign-modal-content">
                  <div className="modal-header">
                    <h2>Administrar Equipo: {selectedCuadrilla.nombre}</h2>
                    <button className="icon-btn" onClick={handleCloseAssignModal}>
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="assign-layout">
                    <div className="assign-form-section">
                       <h3>Asignar Nuevo Miembro</h3>
                       <form onSubmit={handleAssignMember} className="form-row-inline">
                         <div className="form-group flex-2">
                           <label>Voluntario</label>
                           <select 
                             className="modal-input" 
                             value={assignData.userId} 
                             onChange={e => setAssignData({...assignData, userId: e.target.value})}
                           >
                             {usersList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                           </select>
                         </div>
                         <div className="form-group flex-1">
                           <label>Rol</label>
                           <select 
                             className="modal-input" 
                             value={assignData.rolCuadrillaId} 
                             onChange={e => setAssignData({...assignData, rolCuadrillaId: e.target.value})}
                           >
                             {rolesList.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                           </select>
                         </div>
                         <div className="form-group submit-group">
                           <button type="submit" className="btn-primary btn-add-member" disabled={assigningMember}>
                             {assigningMember ? '...' : <Plus size={16}/>}
                           </button>
                         </div>
                       </form>
                    </div>

                    <div className="members-list-section">
                       <h3>Miembros Actuales ({currentMembers.length})</h3>
                       <div className="members-list">
                         {currentMembers.length === 0 ? <p className="text-muted text-center py-1">No hay miembros asignados.</p> : null}
                         {currentMembers.map((m, idx) => (
                           <div key={idx} className="member-item">
                             <div className="member-avatar">{m.name.charAt(0).toUpperCase()}</div>
                             <div className="member-info">
                               <h4>{m.name}</h4>
                               <span className={`member-role ${m.cargo.includes('Capataz') ? 'role-capataz' : 'role-normal'}`}>{m.cargo}</span>
                             </div>
                           </div>
                         ))}
                       </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-primary" onClick={handleCloseAssignModal}>
                      Listo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Ver Integrantes */}
            {showViewMembersModal && selectedCuadrilla && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2>Integrantes: {selectedCuadrilla.nombre}</h2>
                    <button className="icon-btn" onClick={() => setShowViewMembersModal(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="members-list-section mt-1">
                     <div className="members-list">
                       {currentMembers.length === 0 ? <p className="text-muted">No hay miembros asignados a esta cuadrilla.</p> : null}
                       {currentMembers.map((m, idx) => (
                         <div key={idx} className="member-item">
                           <div className="member-avatar">{m.name.charAt(0).toUpperCase()}</div>
                           <div className="member-info">
                             <h4>{m.name}</h4>
                             <span className={`member-role ${m.cargo.includes('Capataz') ? 'role-capataz' : 'role-normal'}`}>{m.cargo}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-primary" onClick={() => setShowViewMembersModal(false)}>
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Crear Herramienta/Material */}
            {showCreateItemModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2>Crear {itemType === 'herramienta' ? 'Herramienta' : 'Material'}</h2>
                    <button className="icon-btn" onClick={() => setShowCreateItemModal(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleCreateItem}>
                    <div className="form-group">
                      <label>Nombre</label>
                      <input 
                        type="text" 
                        placeholder={itemType === 'herramienta' ? 'Ej. Martillo' : 'Ej. Cemento'}
                        value={formData.nombre}
                        onChange={e => setFormData({...formData, nombre: e.target.value})}
                        required
                        className="modal-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Descripción</label>
                      <textarea 
                        placeholder="Descripción del item"
                        value={formData.descripcion}
                        onChange={e => setFormData({...formData, descripcion: e.target.value})}
                        className="modal-input"
                        rows="3"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Cantidad</label>
                        <input 
                          type="number" 
                          placeholder="0"
                          value={formData.cantidad}
                          onChange={e => setFormData({...formData, cantidad: e.target.value})}
                          className="modal-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Estado</label>
                        <select 
                          value={formData.estado}
                          onChange={e => setFormData({...formData, estado: e.target.value})}
                          className="modal-input"
                        >
                          <option value="bueno">Bueno</option>
                          <option value="regular">Regular</option>
                          <option value="malo">Malo</option>
                          <option value="mantencion">En Mantención</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Responsable</label>
                      <input 
                        type="text" 
                        placeholder="Nombre del responsable"
                        value={formData.responsable}
                        onChange={e => setFormData({...formData, responsable: e.target.value})}
                        className="modal-input"
                      />
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn-outline" onClick={() => setShowCreateItemModal(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? 'Creando...' : 'Crear'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Modal Editar Herramienta/Material */}
            {showEditItemModal && selectedItem && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2>Editar {itemType === 'herramienta' ? 'Herramienta' : 'Material'}</h2>
                    <button className="icon-btn" onClick={() => setShowEditItemModal(false)}>
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleEditItem}>
                    <div className="form-group">
                      <label>Nombre</label>
                      <input 
                        type="text" 
                        value={formData.nombre}
                        onChange={e => setFormData({...formData, nombre: e.target.value})}
                        required
                        className="modal-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Descripción</label>
                      <textarea 
                        value={formData.descripcion}
                        onChange={e => setFormData({...formData, descripcion: e.target.value})}
                        className="modal-input"
                        rows="3"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Cantidad</label>
                        <input 
                          type="number" 
                          value={formData.cantidad}
                          onChange={e => setFormData({...formData, cantidad: e.target.value})}
                          className="modal-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Estado</label>
                        <select 
                          value={formData.estado}
                          onChange={e => setFormData({...formData, estado: e.target.value})}
                          className="modal-input"
                        >
                          <option value="bueno">Bueno</option>
                          <option value="regular">Regular</option>
                          <option value="malo">Malo</option>
                          <option value="mantencion">En Mantención</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Responsable</label>
                      <input 
                        type="text" 
                        value={formData.responsable}
                        onChange={e => setFormData({...formData, responsable: e.target.value})}
                        className="modal-input"
                      />
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn-outline" onClick={() => setShowEditItemModal(false)}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn-primary" disabled={submitting}>
                        {submitting ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    );
  }

  // Si no está logueado, mostrar Login/Register
  return (
    <div className="login-container">
      {/* Left Section */}
      <div className="left-section">
        <div className="left-content">
          <span className="tag">Grupo 12 - 2026</span>
          <h1>
            Construyendo <br />
            <span>Comunidad</span> desde la gestión.
          </h1>

          <div className="cards-container">
            <div className="info-card">
              <h3>
                <ArrowRight size={18} /> Precisión
              </h3>
              <p>
                Herramientas técnicas diseñadas para maximizar el impacto en territorio.
              </p>
            </div>
            <div className="info-card">
              <h3>
                <Users size={18} /> Empatía
              </h3>
              <p>
                Centrados en la dignidad humana y el trabajo colectivo.
              </p>
            </div>
          </div>
        </div>

        <div className="left-footer">
          2026 © TECHO
        </div>
      </div>

      {/* Right Section */}
      <div className="right-section">
        <div className="logo-container">
          <div className="techo-logo">
            <div className="logo-text">
              <h2>TECHO</h2>
              <p>Gestión Nacional</p>
            </div>
            <div className="logo-icon">
              <Home size={20} fill="white" />
            </div>
          </div>
        </div>

        <div className="form-header">
          <h2>{mode === 'login' ? 'Acceso al Portal' : 'Crear Cuenta'}</h2>
          <p>
            {mode === 'login'
              ? 'Gestiona proyectos, cuadrillas e impacto social desde una sola plataforma.'
              : 'Únete a la red de gestión de voluntarios de Techo Chile.'}
          </p>
          {error && <p style={{ color: '#ff4d4d', marginTop: '1rem', fontWeight: 'bold' }}>{error}</p>}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <div className="label-row">
                <label>Nombre Completo</label>
              </div>
              <div className="input-wrapper">
                <Users className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <div className="label-row">
              <label>Correo Institucional</label>
            </div>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                placeholder="nombre@techo.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label>Contraseña</label>
              <a href="#" className="forgot-link">¿Olvidaste tu clave?</a>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Cargando...' : (mode === 'login' ? 'Ingresar a Gestión' : 'Registrarse')} <ArrowRight size={18} />
          </button>

          <div className="divider">
            <span>O accede con</span>
          </div>

          <button type="button" className="google-btn">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/5f/Google_Workspace_Logo.svg"
              alt="Google"
              width="180"
            />
          </button>

          <p className="footer-link">
            {mode === 'login' ? '¿Nuevo en el equipo?' : '¿Ya tienes cuenta?'} {' '}
            <a href="#" onClick={(e) => {
              e.preventDefault();
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}>
              {mode === 'login' ? 'Solicitar acceso' : 'Iniciar sesión'}
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}

export default App
