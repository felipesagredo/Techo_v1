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
  Trash2,
  Eye,
  Edit2,
  Plus,
  X
} from 'lucide-react'
import MapPage from '../src/features/mapa/components/MapPage'

// Features.
import CuadrillasView from './features/cuadrillas/components/CuadrillasView'
import VoluntariosView from './features/voluntarios/components/VoluntariosView'
import Herramientas from './pages/Herramientas'
import Materiales from './pages/Materiales'
import AlmuerzosView from './pages/AlmuerzosView'
import Swal from 'sweetalert2'

const showToast = (message, type = 'info') => {
  Swal.fire({
    title: type === 'success' ? '¡Éxito!' : type === 'error' ? '¡Error!' : type === 'warning' ? '¡Advertencia!' : 'Información',
    text: message,
    icon: type,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#004785',
    customClass: {
      popup: 'premium-swal-popup',
      confirmButton: 'premium-swal-confirm-btn'
    }
  });
};

function App() {

  const isJwtValid = (token) => {
    if (!token) return false;

    try {
      const payloadPart = token.split('.')[1];
      if (!payloadPart) return false;

      const normalizedPayload = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload + '='.repeat((4 - (normalizedPayload.length % 4)) % 4);
      const payload = JSON.parse(atob(paddedPayload));

      if (!payload.exp) return true;

      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const unwrapApiList = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    return []
  }

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!savedUser || !token || !isJwtValid(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }

    return JSON.parse(savedUser);
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

  // Estadísticas del Dashboard
  const [dashboardStats, setDashboardStats] = useState({
    totalVoluntarios: 0,
    totalHerramientas: 0,
    totalCuadrillas: 0,
    stockCritico: 0,
    recentCuadrillas: [],
    recentInventory: []
  });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (user && currentView === 'dashboard') {
      setLoadingStats(true);
      fetch('http://localhost:5000/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setDashboardStats(data);
          setLoadingStats(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingStats(false);
        });
    }
  }, [user, currentView]);

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
          setHerramientasList(unwrapApiList(herramientas))
          setMaterialesList(unwrapApiList(materiales))
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
        showToast('Error al crear cuadrilla', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de red al crear cuadrilla', 'error');
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
      showToast('Error cargando datos de asignación', 'error');
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
      showToast('Error cargando miembros', 'error');
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
        showToast(errorData?.error || 'El voluntario ya está asignado a esta cuadrilla o hubo un error.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de conexión al asignar voluntario.', 'error');
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
        showToast(`${itemType === 'herramienta' ? 'Herramienta' : 'Material'} creado exitosamente`, 'success')
        setShowCreateItemModal(false)
        // Reload inventory
        const [herramientas, materiales] = await Promise.all([
          fetch('http://localhost:5000/api/herramientas').then(r => r.json()),
          fetch('http://localhost:5000/api/materiales').then(r => r.json())
        ])
        setHerramientasList(unwrapApiList(herramientas))
        setMaterialesList(unwrapApiList(materiales))
      } else {
        showToast('Error al crear item', 'error')
      }
    } catch (err) {
      console.error(err)
      showToast('Error de conexión', 'error')
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
        showToast(`${itemType === 'herramienta' ? 'Herramienta' : 'Material'} actualizado exitosamente`, 'success')
        setShowEditItemModal(false)
        // Reload inventory
        const [herramientas, materiales] = await Promise.all([
          fetch('http://localhost:5000/api/herramientas').then(r => r.json()),
          fetch('http://localhost:5000/api/materiales').then(r => r.json())
        ])
        setHerramientasList(unwrapApiList(herramientas))
        setMaterialesList(unwrapApiList(materiales))
      } else {
        showToast('Error al actualizar item', 'error')
      }
    } catch (err) {
      console.error(err)
      showToast('Error de conexión', 'error')
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
        showToast(`${type === 'herramienta' ? 'Herramienta' : 'Material'} eliminado exitosamente`, 'success')
        // Reload inventory
        const [herramientas, materiales] = await Promise.all([
          fetch('http://localhost:5000/api/herramientas').then(r => r.json()),
          fetch('http://localhost:5000/api/materiales').then(r => r.json())
        ])
        setHerramientasList(unwrapApiList(herramientas))
        setMaterialesList(unwrapApiList(materiales))
      } else {
        showToast('Error al eliminar item', 'error')
      }
    } catch (err) {
      console.error(err)
      showToast('Error de conexión', 'error')
    }
  }

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMap, setShowMap] = useState(false)

  const [section, setSection] = useState('inicio')
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)

  const [idEditar, setIdEditar] = useState(null)

  const [alimentos, setAlimentos] = useState([])
  const [nuevoAlimento, setNuevoAlimento] = useState({

    nombre: '',

    cantidad: '',

    porciones: '',

    tipoDieta: 'Normal',

  })

  const handleLogout = () => {

    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setUser(null)
  }

  // OBTENER ALIMENTOS

  const obtenerAlimentos = async () => {

    try {

      const response = await fetch(
        'http://localhost:5000/api/alimentos',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {

        console.error(data)

        setAlimentos([])

        return
      }

      setAlimentos(
        Array.isArray(data)
          ? data
          : []
      )

    } catch (error) {

      console.log(error)

      setAlimentos([])
    }
  }

  // CREAR ALIMENTO

  const crearAlimento = async () => {

    if (!nuevoAlimento.nombre.trim()) return

    try {

      await fetch(
        'http://localhost:5000/api/alimentos',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },

          body: JSON.stringify({

            nombre: nuevoAlimento.nombre,

            cantidad: Number(
              nuevoAlimento.cantidad
            ),

            porciones: Number(
              nuevoAlimento.porciones
            ),

            tipoDieta:
              nuevoAlimento.tipoDieta,

          }),
        }
      )

      setNuevoAlimento({
        nombre: '',
        cantidad: '',
        porciones: '',
        tipoDieta: 'Normal',
      })

      obtenerAlimentos()

    } catch (error) {

      console.log(error)
    }
  }
  // EDITAR ALIMENTO
  const editarAlimento = (alimento) => {

    setModoEdicion(true)

    setIdEditar(alimento.id)

    setMostrarFormulario(true)

    setNuevoAlimento({

      nombre: alimento.nombre,

      cantidad: alimento.cantidad,

      porciones: alimento.porciones,

      tipoDieta: alimento.tipoDieta,

    })

  }

  const guardarEdicion = async () => {

    try {

      await fetch(

        `http://localhost:5000/api/alimentos/${idEditar}`,

        {

          method: 'PUT',

          headers: {

            'Content-Type': 'application/json',

            Authorization:
              `Bearer ${localStorage.getItem('token')}`,

          },

          body: JSON.stringify(nuevoAlimento),

        }

      )

      setModoEdicion(false)

      setIdEditar(null)

      setMostrarFormulario(false)

      setNuevoAlimento({

        nombre: '',

        cantidad: '',

        porciones: '',

        tipoDieta: 'Normal',

      })

      obtenerAlimentos()

    }

    catch (error) {

      console.log(error)

    }

  }

  // ELIMINAR ALIMENTO

  const eliminarAlimento = async (id) => {

    try {

      await fetch(
        `http://localhost:5000/api/alimentos/${id}`,
        {
          method: 'DELETE',

          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )

      obtenerAlimentos()

    } catch (error) {

      console.log(error)
    }
  }

  useEffect(() => {

    if (user) {
      obtenerAlimentos()
    }

  }, [user])

  // LOGIN / REGISTRO

  const handleSubmit = async (e) => {

    e.preventDefault()

    setLoading(true)
    setError('')

    const endpoint = mode === 'login' ? '/api/login' : '/api/register'
    const body = mode === 'login'
      ? { email, password }
      : { name, email, password }

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {

        if (mode === 'register') {
          Swal.fire({
            title: '¡Registro Exitoso!',
            text: '¡Registro exitoso! Ahora puedes iniciar sesión.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#004785',
            customClass: {
              popup: 'premium-swal-popup',
              confirmButton: 'premium-swal-confirm-btn'
            }
          });
          setMode('login')

          setName('')
          setEmail('')
          setPassword('')

        } else {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))

          Swal.fire({
            title: '¡Inicio de Sesión Exitoso!',
            text: `¡Bienvenido, ${data.user.name}!`,
            icon: 'success',
            confirmButtonText: 'Entrar al Portal',
            confirmButtonColor: '#004785',
            customClass: {
              popup: 'premium-swal-popup',
              confirmButton: 'premium-swal-confirm-btn'
            }
          }).then(() => {
            setUser(data.user)
          });
        }

      } else {

        setError(data.message || 'Error')

      }

    } catch (error) {

      setError('No se pudo conectar con el servidor')

    } finally {

      setLoading(false)
    }
  }


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
              <a href="#" className={currentView === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentView('dashboard'); }}>Resumen</a>
              <a href="#">Reportes</a>
              <a href="#" className={currentView === 'map' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentView('map'); }}>Geolocalización</a>
            </nav>
          </div>
          <div className="top-nav-right">
            <button className="icon-btn"><Bell size={18} /></button>
            <button className="icon-btn"><Settings size={18} /></button>
            <div className="user-avatar-small">{user.name ? user.name.charAt(0).toUpperCase() : 'T'}</div>
          </div>
        </header>

        <div className="dashboard-content-wrapper">
          {/* Sidebar */}
          <aside className="sidebar-modern">
            <div className="sidebar-profile">
              <h3>{user.role_id === 1 ? 'Administrador' : user.role_id === 3 ? 'Socio' : 'Voluntario'}</h3>
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
              <a href="#" className={currentView === 'materiales' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentView('materiales'); }}>
                <Package size={18} /> Materiales
              </a>
              <a href="#" className={currentView === 'almuerzos' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentView('almuerzos'); }}>
                <Utensils size={18} /> Almuerzos
              </a>
              <a href="#" className={currentView === 'map' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setCurrentView('map'); }}>
                <MapPin size={18} /> Mapa
              </a>
            </nav>
            <div className="sidebar-bottom">
              <div className="user-profile-card">
                <div>
                  <h4>{user.name}</h4>
                  <p>{user.role_id === 1 ? 'Administrador' : user.role_id === 3 ? 'Socio' : 'Voluntario'}</p>
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
                  </div>
                </div>

                {/* KPIs */}
                <div className="kpi-grid">
                  <div className="kpi-card blue">
                    <div className="kpi-header">
                      <div className="kpi-icon blue-bg"><Users size={20} /></div>
                      <span className="kpi-badge green">Activos</span>
                    </div>
                    <div className="kpi-body">
                      <p className="kpi-label">VOLUNTARIOS REGISTRADOS</p>
                      <h2>{loadingStats ? '...' : dashboardStats.totalVoluntarios}</h2>
                      <p className="kpi-sub">Listos para asignación</p>
                    </div>
                  </div>

                  <div className="kpi-card blue">
                    <div className="kpi-header">
                      <div className="kpi-icon blue-bg"><Wrench size={20} /></div>
                      <span className="kpi-badge gray">Inventario</span>
                    </div>
                    <div className="kpi-body">
                      <p className="kpi-label">TOTAL HERRAMIENTAS</p>
                      <h2>{loadingStats ? '...' : dashboardStats.totalHerramientas}</h2>
                      <p className="kpi-sub">En almacén y en préstamo</p>
                    </div>
                  </div>

                  <div className="kpi-card brown">
                    <div className="kpi-header">
                      <div className="kpi-icon brown-bg"><Users size={20} /></div>
                      <span className="kpi-badge blue">Activas</span>
                    </div>
                    <div className="kpi-body">
                      <p className="kpi-label">CUADRILLAS EN TERRENO</p>
                      <h2>{loadingStats ? '...' : dashboardStats.totalCuadrillas}</h2>
                      <p className="kpi-sub">Organizadas y en progreso</p>
                    </div>
                  </div>

                  <div className="kpi-card red active-alert">
                    <div className="kpi-header">
                      <div className="kpi-icon red-bg"><AlertTriangle size={20} /></div>
                      <span className="kpi-badge red-solid">ALERTA</span>
                    </div>
                    <div className="kpi-body">
                      <p className="kpi-label">ESTADO CRÍTICO / DAÑADO</p>
                      <h2>{loadingStats ? '...' : `${dashboardStats.stockCritico} Items`}</h2>
                      <p className="kpi-sub">Requiere revisión inmediata</p>
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
                          <h3>Estado del Almacén</h3>
                          <p>Herramientas y materiales recientes</p>
                        </div>
                        <a href="#" className="link-action" onClick={(e) => { e.preventDefault(); setCurrentView('herramientas'); }}>Ver todo el inventario <ChevronRight size={16} /></a>
                      </div>
                      <div className="inventory-list">
                        {(!dashboardStats.recentInventory || dashboardStats.recentInventory.length === 0) ? (
                          <p className="no-items-text" style={{ padding: '1.5rem', color: '#868e96', textAlign: 'center' }}>No hay items en el inventario.</p>
                        ) : (
                          dashboardStats.recentInventory.map(item => {
                            const isTool = item.tipo === 'herramienta';
                            const isCritical = item.estado === 'malo' || item.estado === 'dañado' || item.cantidad <= 5;
                            return (
                              <div key={`${item.tipo}-${item.id}`} className="inventory-item">
                                <div className="item-icon dark-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {isTool ? <Wrench size={16} color="white" /> : <Package size={16} color="white" />}
                                </div>
                                <div className="item-details">
                                  <h4>{item.nombre}</h4>
                                  <p>Tipo: {isTool ? 'Herramienta' : 'Material'}</p>
                                </div>
                                <div className="item-status">
                                  <h4>{isTool ? `${item.cantidad} Unidades` : `${item.cantidad} Unidades`}</h4>
                                  <span className={isCritical ? 'text-red' : 'text-green'}>
                                    {isCritical ? 'ESTADO CRÍTICO' : 'STOCK DISPONIBLE'}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Cuadrillas */}
                    <div className="cuadrillas-section">
                      <div className="section-header">
                        <h3>Cuadrillas Recientes</h3>
                        <span className="active-dot">{dashboardStats.totalCuadrillas} registradas</span>
                      </div>
                      <div className="cuadrillas-grid">
                        {(!dashboardStats.recentCuadrillas || dashboardStats.recentCuadrillas.length === 0) ? (
                          <p className="no-items-text" style={{ padding: '1.5rem', color: '#868e96', width: '100%', textAlign: 'center' }}>No hay cuadrillas creadas aún.</p>
                        ) : (
                          dashboardStats.recentCuadrillas.map(c => (
                            <div key={c.id} className="cuadrilla-card">
                              <div className="cuadrilla-info">
                                <div className="cuadrilla-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                  {c.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4>{c.nombre}</h4>
                                  <p>{c.zona}</p>
                                </div>
                              </div>
                              <div className="cuadrilla-footer">
                                <div className="avatar-group" style={{ fontSize: '0.8rem', color: '#666' }}>
                                  👥 {c.miembros_count} miembros
                                </div>
                                <span className={`cv-badge badge-${(c.estado || 'PENDIENTE').toLowerCase().replace(/\s/g, '-')}`} style={{ fontSize: '0.7rem' }}>
                                  {c.estado || 'PENDIENTE'}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
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
                        <button className="btn-outline full-width mt-1" onClick={(e) => { e.preventDefault(); setCurrentView('map'); }}>Ver Mapa Interactivo</button>
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
              <CuadrillasView user={user} currentView={currentView} />
            )}

            {currentView === 'registro' && (
              <VoluntariosView />
            )}

            {/* HERRAMIENTAS & MATERIALES VIEW */}
            {currentView === 'herramientas' && <Herramientas user={user} />}

            {/* MATERIALES VIEW */}
            {currentView === 'materiales' && <Materiales user={user} />}

            {/* MAP VIEW */}
            {currentView === 'map' && (
              <MapPage onBack={() => setCurrentView('dashboard')} />
            )}

            {/* ALMUERZOS VIEW */}
            {currentView === 'almuerzos' && <AlmuerzosView user={user} />}

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
                        onChange={e => setNewCuadrillaData({ ...newCuadrillaData, nombre: e.target.value })}
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
                        onChange={e => setNewCuadrillaData({ ...newCuadrillaData, zona: e.target.value })}
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
                            onChange={e => setAssignData({ ...assignData, userId: e.target.value })}
                          >
                            {usersList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                          </select>
                        </div>
                        <div className="form-group flex-1">
                          <label>Rol</label>
                          <select
                            className="modal-input"
                            value={assignData.rolCuadrillaId}
                            onChange={e => setAssignData({ ...assignData, rolCuadrillaId: e.target.value })}
                          >
                            {rolesList.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                          </select>
                        </div>
                        <div className="form-group submit-group">
                          <button type="submit" className="btn-primary btn-add-member" disabled={assigningMember}>
                            {assigningMember ? '...' : <Plus size={16} />}
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
                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                        required
                        className="modal-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Descripción</label>
                      <textarea
                        placeholder="Descripción del item"
                        value={formData.descripcion}
                        onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
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
                          onChange={e => setFormData({ ...formData, cantidad: e.target.value })}
                          className="modal-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Estado</label>
                        <select
                          value={formData.estado}
                          onChange={e => setFormData({ ...formData, estado: e.target.value })}
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
                        onChange={e => setFormData({ ...formData, responsable: e.target.value })}
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
                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                        required
                        className="modal-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Descripción</label>
                      <textarea
                        value={formData.descripcion}
                        onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
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
                          onChange={e => setFormData({ ...formData, cantidad: e.target.value })}
                          className="modal-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Estado</label>
                        <select
                          value={formData.estado}
                          onChange={e => setFormData({ ...formData, estado: e.target.value })}
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
                        onChange={e => setFormData({ ...formData, responsable: e.target.value })}
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

  // LOGIN

  return (
    <div className="login-container">

      <div className="left-section">

        <div className="left-content">
          <h1>
            Construyendo
            <br />
            <span>Comunidad</span>
            {' '}
            desde la gestión.
          </h1>

          <div className="cards-container">

            <div className="info-card">
              <h3>
                <ArrowRight size={18} />
                {' '}
                Precisión
              </h3>
              <p>
                Herramientas diseñadas
                para maximizar el impacto.
              </p>
            </div>

            <div className="info-card">
              <h3>
                <Users size={18} />
                {' '}
                Empatía
              </h3>
              <p>
                Centrados en el trabajo colectivo.
              </p>
            </div>

          </div>
        </div>

        <div className="left-footer">
          2026 © TECHO
        </div>

      </div>

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
          <h2>
            {mode === 'login' ? 'Acceso al Portal' : 'Crear Cuenta'}
          </h2>
          <p>
            {mode === 'login'
              ? 'Gestiona proyectos, cuadrillas e impacto social desde una sola plataforma.'
              : 'Únete a la red de gestión de voluntarios de Techo Chile.'}
          </p>
          {error && (
            <p style={{ color: 'red', marginTop: '1rem' }}>
              {error}
            </p>
          )}
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
              <label>Correo</label>
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

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >
            {loading
              ? 'Cargando...'
              : (mode === 'login' ? 'Ingresar' : 'Registrarse')
            }
            <ArrowRight size={18} />
          </button>

          <p className="footer-link">
            {mode === 'login' ? '¿Nuevo en el equipo?' : '¿Ya tienes cuenta?'}
            {' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setMode(mode === 'login' ? 'register' : 'login')
                setError('')
              }}
            >
              {mode === 'login' ? 'Registrarse' : 'Iniciar sesión'}
            </a>
          </p>

        </form>

      </div>

    </div>
  )
}

export default App
