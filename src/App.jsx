import React, { useState } from 'react'
import {
  Mail,
  Lock,
  Users,
  ArrowRight,
  Home
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

    const endpoint = mode === 'login'
  ? '/api/auth/login'
  : '/api/auth/register'
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
      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="logo-icon small">
              <Home size={16} fill="white" />
            </div>
            <span>TECHO GESTIÓN</span>
          </div>
          <nav className="sidebar-nav">
            <a href="#" className="active"><Home size={18} /> Inicio</a>
            <a href="#"><Users size={18} /> Voluntarios</a>
            <a href="#"><ArrowRight size={18} /> Proyectos</a>
            <a href="#"><Lock size={18} /> Herramientas</a>
          </nav>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </aside>

        <main className="dashboard-main">
          <header className="main-header">
            <h1>Bienvenido, {user.name}</h1>
            <div className="user-profile">
              <div className="avatar">{user.name.charAt(0)}</div>
              <span>{user.email}</span>
            </div>
          </header>

          <section className="stats-grid">
            <div className="stat-card">
              <h3>Proyectos Activos</h3>
              <p className="stat-value">12</p>
              <span className="stat-label">+2 esta semana</span>
            </div>
            <div className="stat-card">
              <h3>Voluntarios</h3>
              <p className="stat-value">148</p>
              <span className="stat-label">En terreno</span>
            </div>
            <div className="stat-card">
              <h3>Impacto Social</h3>
              <p className="stat-value">2.4k</p>
              <span className="stat-label">Familias</span>
            </div>
          </section>

          <div className="content-placeholder">
            <h2>Panel de Actividad</h2>
            <p>Aquí se desplegará la información detallada de la gestión en territorio.</p>
            <div className="empty-state">
              Próximamente: Integración con el módulo de Herramientas.
            </div>
          </div>
        </main>
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
