import React, { useState } from 'react'
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
  Calendar
} from 'lucide-react'

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [mode, setMode] = useState('login')
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
              <a href="#" className="active">
                <LayoutDashboard size={18} /> Panel Control
              </a>
              <a href="#">
                <Package size={18} /> Inventario
              </a>
              <a href="#">
                <Users size={18} /> Voluntarios
              </a>
              <a href="#">
                <Users size={18} /> Cuadrillas
              </a>
              <a href="#">
                <Wrench size={18} /> Herramientas
              </a>
            </nav>
            <div className="sidebar-bottom">
              <button className="btn-primary full-width">Nueva Campaña</button>
              <button className="logout-btn-modern" onClick={handleLogout}>
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-dashboard">
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
                    <a href="#" className="link-action">Ver todo el almacén <ChevronRight size={16}/></a>
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
                      <div className="item-icon dark-bg"><Package size={20} color="white"/></div>
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
                      <div className="item-icon dark-bg"><Wrench size={20} color="white"/></div>
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
