import React from 'react';
import { Plus, Save } from 'lucide-react';

function FormularioAlimento({
  nuevoAlimento,
  setNuevoAlimento,
  crearAlimento,
  guardarEdicion,
  modoEdicion,
  jornadas = [],
  usuarios = [],
}) {
  const inputStyle = {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    outline: 'none',
    fontSize: '14px',
    color: '#495057',
    backgroundColor: '#fff',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    width: '100%',
    boxSizing: 'border-box',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '12px 10px',
    paddingRight: '36px',
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#004785',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'background-color 0.15s ease-in-out',
    whiteSpace: 'nowrap',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#6c757d',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Fila 1: Nombre, Cantidad, Porciones, Tipo Dieta */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '15px',
          alignItems: 'end',
        }}
      >
        <div>
          <label style={labelStyle}>Nombre del alimento</label>
          <input
            type="text"
            placeholder="Ej: Arroz con pollo"
            value={nuevoAlimento.nombre}
            onChange={(e) =>
              setNuevoAlimento({ ...nuevoAlimento, nombre: e.target.value })
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Cantidad (unidades)</label>
          <input
            type="number"
            placeholder="0"
            min="0"
            value={nuevoAlimento.cantidad}
            onChange={(e) =>
              setNuevoAlimento({ ...nuevoAlimento, cantidad: e.target.value })
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Porciones</label>
          <input
            type="number"
            placeholder="0"
            min="0"
            value={nuevoAlimento.porciones}
            onChange={(e) =>
              setNuevoAlimento({ ...nuevoAlimento, porciones: e.target.value })
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Tipo de Dieta</label>
          <select
            value={nuevoAlimento.tipoDieta}
            onChange={(e) =>
              setNuevoAlimento({ ...nuevoAlimento, tipoDieta: e.target.value })
            }
            style={selectStyle}
          >
            <option>Normal</option>
            <option>Vegetariana</option>
            <option>Vegana</option>
            <option>Celíaca</option>
          </select>
        </div>
      </div>

      {/* Separador sección jornada */}
      <div
        style={{
          borderTop: '1px dashed #dee2e6',
          paddingTop: '14px',
        }}
      >
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#004785', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          📋 Asignación de jornada (opcional)
        </p>

        {/* Fila 2: Jornada activa + Encargado + Botón */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr)) auto',
            gap: '15px',
            alignItems: 'end',
          }}
        >
          <div>
            <label style={labelStyle}>Jornada activa</label>
            <select
              value={nuevoAlimento.jornadaId || ''}
              onChange={(e) =>
                setNuevoAlimento({ ...nuevoAlimento, jornadaId: e.target.value || null })
              }
              style={selectStyle}
            >
              <option value="">— Sin jornada —</option>
              {jornadas.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nombre} {j.responsable ? `(Resp: ${j.responsable})` : ''}
                </option>
              ))}
            </select>
            {jornadas.length === 0 && (
              <p style={{ fontSize: '11px', color: '#adb5bd', marginTop: '4px' }}>
                No hay jornadas activas disponibles
              </p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Encargado</label>
            <select
              value={nuevoAlimento.encargado || ''}
              onChange={(e) =>
                setNuevoAlimento({ ...nuevoAlimento, encargado: e.target.value || null })
              }
              style={selectStyle}
              disabled={!nuevoAlimento.jornadaId}
            >
              <option value="">— Sin encargado —</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name} {u.email ? `(${u.email})` : ''}
                </option>
              ))}
            </select>
            {!nuevoAlimento.jornadaId && (
              <p style={{ fontSize: '11px', color: '#adb5bd', marginTop: '4px' }}>
                Selecciona primero una jornada
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={modoEdicion ? guardarEdicion : crearAlimento}
            style={buttonStyle}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#003666')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#004785')}
          >
            {modoEdicion ? (
              <>
                <Save size={16} />
                <span>Guardar cambios</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FormularioAlimento;