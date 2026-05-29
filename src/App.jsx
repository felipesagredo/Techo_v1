import React, { useEffect, useState } from 'react'
import {
  Mail,
  Lock,
  Users,
  ArrowRight,
  Home
} from 'lucide-react'

function App() {

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const [mode, setMode] = useState('login')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [section, setSection] = useState('inicio')

  const [alimentos, setAlimentos] = useState([])
  const [nuevoAlimento, setNuevoAlimento] = useState('')

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

      setAlimentos(data)

    } catch (error) {

      console.log(error)
    }
  }

  // CREAR ALIMENTO

  const crearAlimento = async () => {

    if (!nuevoAlimento.trim()) return

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
            nombre: nuevoAlimento,
          }),
        }
      )

      setNuevoAlimento('')

      obtenerAlimentos()

    } catch (error) {

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

    const endpoint =
      mode === 'login'
        ? '/api/auth/login'
        : '/api/auth/register'

    const body =
      mode === 'login'
        ? { email, password }
        : {
            name,
            email,
            password,
            role: 'voluntario',
          }

    try {

      const response = await fetch(
        `http://localhost:5000${endpoint}`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(body),
        }
      )

      const data = await response.json()

      if (response.ok) {

        if (mode === 'register') {

          alert('Registro exitoso')

          setMode('login')

          setName('')
          setEmail('')
          setPassword('')

        } else {

          localStorage.setItem(
            'token',
            data.token
          )

          localStorage.setItem(
            'user',
            JSON.stringify(data.user)
          )

          setUser(data.user)

          alert(`Bienvenido ${data.user.name}`)
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

      <div className="dashboard-container">

        <aside className="sidebar">

          <div className="sidebar-header">

            <div className="logo-icon small">
              <Home size={16} fill="white" />
            </div>

            <span>TECHO GESTIÓN</span>

          </div>

          <nav className="sidebar-nav">

            <a
              href="#"
              className={section === 'inicio' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault()
                setSection('inicio')
              }}
            >
              <Home size={18} />
              Inicio
            </a>

            <a href="#">
              <Users size={18} />
              Voluntarios
            </a>

            <a href="#">
              <ArrowRight size={18} />
              Proyectos
            </a>

            <a href="#">
              <Lock size={18} />
              Herramientas
            </a>

            <a
              href="#"
              className={section === 'alimentos' ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault()
                setSection('alimentos')
              }}
            >
              <Users size={18} />
              Alimentos
            </a>

          </nav>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>

        </aside>

        <main className="dashboard-main">

          <header className="main-header">

            <h1>
              Bienvenido, {user.name}
            </h1>

            <div className="user-profile">

              <div className="avatar">
                {user.name.charAt(0)}
              </div>

              <span>{user.email}</span>

            </div>

          </header>

          <section className="stats-grid">

            <div className="stat-card">
              <h3>Proyectos Activos</h3>
              <p className="stat-value">12</p>
              <span className="stat-label">
                +2 esta semana
              </span>
            </div>

            <div className="stat-card">
              <h3>Voluntarios</h3>
              <p className="stat-value">148</p>
              <span className="stat-label">
                En terreno
              </span>
            </div>

            <div className="stat-card">
              <h3>Impacto Social</h3>
              <p className="stat-value">2.4k</p>
              <span className="stat-label">
                Familias
              </span>
            </div>

          </section>

          {
            section === 'inicio'
              ? (

                <div className="content-placeholder">

                  <h2>Panel de Actividad</h2>

                  <p>
                    Aquí se desplegará la información de gestión.
                  </p>

                  <div className="empty-state">
                    Bienvenido al sistema TECHO.
                  </div>

                </div>

              )
              : (

                <div className="content-placeholder">

                  <h2>Gestión de Alimentos</h2>

                  <p>
                    Control y monitoreo de alimentos disponibles.
                  </p>

                  {
                    user.role === 'admin' && (

                      <div
                        style={{
                          marginBottom: '20px',
                        }}
                      >

                        <input
                          type="text"
                          placeholder="Nuevo alimento"
                          value={nuevoAlimento}
                          onChange={(e) =>
                            setNuevoAlimento(e.target.value)
                          }
                        />

                        <button
                          type="button"
                          onClick={crearAlimento}
                        >
                          Agregar
                        </button>

                      </div>
                    )
                  }

                  <div>

                    {
                      alimentos.map((alimento) => (

                        <div
                          key={alimento.id}
                          className="stat-card"
                          style={{
                            marginBottom: '15px',
                          }}
                        >

                          <h3>
                            {alimento.nombre}
                          </h3>

                          <p>
                            Estado:
                            {' '}
                            {
                              alimento.asignado
                                ? 'Asignado'
                                : 'Disponible'
                            }
                          </p>

                          {
                            user.role === 'admin' && (

                              <button
                                type="button"
                                onClick={() =>
                                  eliminarAlimento(alimento.id)
                                }
                              >
                                Eliminar
                              </button>
                            )
                          }

                        </div>
                      ))
                    }

                  </div>

                </div>
              )
          }

        </main>

      </div>
    )
  }

  // LOGIN

  return (

    <div className="login-container">

      <div className="left-section">

        <div className="left-content">

          <span className="tag">
            Grupo 12 - 2026
          </span>

          <h1>
            Construyendo
            <br />

            <span>
              Comunidad
            </span>

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
            {
              mode === 'login'
                ? 'Acceso al Portal'
                : 'Crear Cuenta'
            }
          </h2>

          <p>
            {
              mode === 'login'
                ? 'Gestiona proyectos y alimentos.'
                : 'Únete a la plataforma.'
            }
          </p>

          {
            error && (
              <p
                style={{
                  color: 'red',
                  marginTop: '1rem',
                }}
              >
                {error}
              </p>
            )
          }

        </div>

        <form onSubmit={handleSubmit}>

          {
            mode === 'register' && (

              <div className="form-group">

                <div className="label-row">
                  <label>Nombre Completo</label>
                </div>

                <div className="input-wrapper">

                  <Users
                    className="input-icon"
                    size={18}
                  />

                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    required
                  />

                </div>

              </div>
            )
          }

          <div className="form-group">

            <div className="label-row">
              <label>Correo</label>
            </div>

            <div className="input-wrapper">

              <Mail
                className="input-icon"
                size={18}
              />

              <input
                type="email"
                placeholder="correo@techo.org"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

            </div>

          </div>

          <div className="form-group">

            <div className="label-row">

              <label>Contraseña</label>

            </div>

            <div className="input-wrapper">

              <Lock
                className="input-icon"
                size={18}
              />

              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>

          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading}
          >

            {
              loading
                ? 'Cargando...'
                : (
                  mode === 'login'
                    ? 'Ingresar'
                    : 'Registrarse'
                )
            }

            <ArrowRight size={18} />

          </button>

          <p className="footer-link">

            {
              mode === 'login'
                ? '¿Nuevo en el equipo?'
                : '¿Ya tienes cuenta?'
            }

            {' '}

            <a
              href="#"
              onClick={(e) => {

                e.preventDefault()

                setMode(
                  mode === 'login'
                    ? 'register'
                    : 'login'
                )

                setError('')
              }}
            >
              {
                mode === 'login'
                  ? 'Registrarse'
                  : 'Iniciar sesión'
              }
            </a>

          </p>

        </form>

      </div>

    </div>
  )
}

export default App