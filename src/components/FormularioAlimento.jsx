function FormularioAlimento({

  nuevoAlimento,

  setNuevoAlimento,

  crearAlimento,

  guardarEdicion,

  modoEdicion,

}) {

  return (

    <div
      style={{
        marginBottom: '30px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr) auto',
        gap: '15px',
      }}
    >

      <input
        type="text"
        placeholder="Nombre"
        value={nuevoAlimento.nombre}
        onChange={(e) =>
          setNuevoAlimento({
            ...nuevoAlimento,
            nombre: e.target.value,
          })
        }
      />

      <input
        type="number"
        placeholder="Cantidad"
        value={nuevoAlimento.cantidad}
        onChange={(e) =>
          setNuevoAlimento({
            ...nuevoAlimento,
            cantidad: e.target.value,
          })
        }
      />

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
      />

      <select
        value={nuevoAlimento.tipoDieta}
        onChange={(e) =>
          setNuevoAlimento({
            ...nuevoAlimento,
            tipoDieta: e.target.value,
          })
        }
      >

        <option>Normal</option>
        <option>Vegetariana</option>
        <option>Vegana</option>
        <option>Celíaca</option>

      </select>

      <button
        type="button"
        onClick={
          modoEdicion
            ? guardarEdicion
            : crearAlimento
        }
      >

        {

          modoEdicion

            ? 'Guardar cambios'

            : 'Agregar'

        }

      </button>

    </div>

  )

}

export default FormularioAlimento