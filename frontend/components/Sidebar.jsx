import {
  Home,
  Users,
  ArrowRight,
  Package,
  LogOut,
} from 'lucide-react'

function Sidebar({

  section,

  setSection,

  handleLogout,

}) {

  const menu = [

    {
      id: 'inicio',
      text: 'Inicio',
      icon: Home,
    },

    {
      id: 'voluntarios',
      text: 'Voluntarios',
      icon: Users,
    },

    {
      id: 'proyectos',
      text: 'Proyectos',
      icon: ArrowRight,
    },

    {
      id: 'herramientas',
      text: 'Herramientas',
      icon: Package,
    },

    {
      id: 'alimentos',
      text: 'Alimentos',
      icon: Users,
    },

  ]

  return (

    <aside className="sidebar">

      <div>

        <div className="brand">

          <Home size={18} fill="white" />

          <span>

            TECHO GESTIÓN

          </span>

        </div>

        <nav>

          {

            menu.map((item) => {

              const Icon = item.icon

              return (

                <button

                  key={item.id}

                  className={
                    section === item.id

                      ? 'nav-item active'

                      : 'nav-item'
                  }

                  onClick={() =>
                    setSection(item.id)
                  }

                >

                  <Icon size={18} />

                  {item.text}

                </button>

              )

            })

          }

        </nav>

      </div>

      <button

        className="logout-btn"

        onClick={handleLogout}

      >

        <LogOut size={18} />

        Cerrar sesión

      </button>

    </aside>

  )

}

export default Sidebar