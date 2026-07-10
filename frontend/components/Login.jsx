import React from 'react'
import {
  Mail,
  Lock,
  Users,
  ArrowRight,
  Home
} from 'lucide-react'

function Login({

  mode,

  setMode,

  name,

  setName,

  email,

  setEmail,

  password,

  setPassword,

  loading,

  error,

  handleSubmit,

}) {

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

            {' '}desde la gestión.

          </h1>

          <div className="cards-container">

            <div className="info-card">

              <h3>

                <ArrowRight size={18} />

                {' '}Precisión

              </h3>

              <p>

                Herramientas diseñadas
                para maximizar el impacto.

              </p>

            </div>

            <div className="info-card">

              <h3>

                <Users size={18} />

                {' '}Empatía

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

export default Login