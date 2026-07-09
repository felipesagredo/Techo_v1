import { Pencil, Trash2 } from 'lucide-react'

function TablaAlimentos({

  alimentos,

  user,

  eliminarAlimento,

}) {

  return (

    <div
      style={{
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 10px rgba(0,0,0,.08)',
      }}
    >

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >

        <thead>

          <tr
            style={{
              background: '#0066CC',
              color: '#fff',
            }}
          >

            <th style={{ padding: '15px' }}>
              Nombre
            </th>

            <th>Cantidad</th>

            <th>Porciones</th>

            <th>Dieta</th>

            <th>Estado</th>

            <th>Encargado</th>

            {

              user.role === 'admin' &&

              <th>Acciones</th>

            }

          </tr>

        </thead>

        <tbody>

          {

            alimentos.map((alimento) => (

              <tr
                key={alimento.id}
                style={{
                  borderBottom:
                    '1px solid #ececec',
                }}
              >

                <td
                  style={{
                    padding: '15px',
                    fontWeight: '600',
                  }}
                >

                  {alimento.nombre}

                </td>

                <td align="center">

                  {alimento.cantidad}

                </td>

                <td align="center">

                  {alimento.porciones}

                </td>

                <td align="center">

                  {alimento.tipoDieta}

                </td>

                <td align="center">

                  {

                    alimento.jornadaActiva

                      ? '🟡 En jornada'

                      : '🟢 Disponible'

                  }

                </td>

                <td align="center">

                  {

                    alimento.encargado ||

                    '-'

                  }

                </td>

                {

                  user.role === 'admin' && (

                    <td align="center">

                      <button
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          marginRight: '10px',
                        }}
                      >

                        <Pencil
                          size={18}
                          color="#0066CC"
                        />

                      </button>

                      <button
                        onClick={() => {

  const confirmar = window.confirm(

    `¿Eliminar "${alimento.nombre}"?`

  )

  if (confirmar) {

    eliminarAlimento(alimento.id)

  }

}}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                        }}
                      >

                        <Trash2
                          size={18}
                          color="#d11a2a"
                        />

                      </button>

                    </td>

                  )

                }

              </tr>

            ))

          }

        </tbody>

      </table>

    </div>

  )

}

export default TablaAlimentos