import React, { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import SearchBar from './components/SearchBar'
import TablaAlimentos from './components/TablaAlimentos'
import FormularioAlimento from './components/FormularioAlimento'
import {
  Mail,
  Lock,
  Users,
  ArrowRight,
  Trash2,
  Pencil,
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

<Sidebar

    section={section}

    setSection={setSection}

    handleLogout={handleLogout}

/>

        <main className="dashboard-main">

<Header
    user={user}
/>

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
                  <div
  style={{
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
  }}
>

  <button
    type="button"
    onClick={() =>
      setMostrarFormulario(!mostrarFormulario)
    }
  >
    + Nuevo alimento
  </button>

</div>
                  <SearchBar

  busqueda={busqueda}

  setBusqueda={setBusqueda}

/>

{
  user.role === 'admin' &&
  mostrarFormulario && (

    <FormularioAlimento
      nuevoAlimento={nuevoAlimento}
      setNuevoAlimento={setNuevoAlimento}
      crearAlimento={crearAlimento}
    />

  )
}

<TablaAlimentos
  alimentos={
    alimentos.filter((alimento) =>
      alimento.nombre
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    )
  }
  user={user}
  eliminarAlimento={eliminarAlimento}
/>

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