import React from 'react';
import { Plus, Save } from 'lucide-react';

function FormularioAlimento({
  nuevoAlimento,
  setNuevoAlimento,
  crearAlimento,
  guardarEdicion,
  modoEdicion,
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

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
        gap: '15px',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <div>
        <input
          type="text"
          placeholder="Nombre del alimento"
          value={nuevoAlimento.nombre}
          onChange={(e) =>
            setNuevoAlimento({
              ...nuevoAlimento,
              nombre: e.target.value,
            })
          }
          style={inputStyle}
        />
      </div>

      <div>
        <input
          type="number"
          placeholder="Cantidad (unidades)"
          value={nuevoAlimento.cantidad}
          onChange={(e) =>
            setNuevoAlimento({
              ...nuevoAlimento,
              cantidad: e.target.value,
            })
          }
          style={inputStyle}
        />
      </div>

      <div>
        <input
          type="number"
          placeholder="Porciones"
          value={nuevoAlimento.porciones}
          onChange={(e) =>
            setNuevoAlimento({
              ...nuevoAlimento,
              porciones: e.target.value,
            })
          }
          style={inputStyle}
        />
      </div>

      <div>
        <select
          value={nuevoAlimento.tipoDieta}
          onChange={(e) =>
            setNuevoAlimento({
              ...nuevoAlimento,
              tipoDieta: e.target.value,
            })
          }
          style={selectStyle}
        >
          <option>Normal</option>
          <option>Vegetariana</option>
          <option>Vegana</option>
          <option>Celíaca</option>
        </select>
      </div>

      <button
        type="button"
        onClick={modoEdicion ? guardarEdicion : crearAlimento}
        style={buttonStyle}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#003666'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#004785'}
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
  );
}

export default FormularioAlimento;