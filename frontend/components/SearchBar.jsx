function SearchBar({ busqueda, setBusqueda }) {

  return (

    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}
    >

      <input
        type="text"
        placeholder="🔍 Buscar alimento..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{
          width: '300px',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #d9d9d9',
          outline: 'none',
          fontSize: '15px',
        }}
      />

    </div>

  )

}

export default SearchBar