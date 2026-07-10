import React from 'react';
import '../../../styles/HerramientasInventario.css';
import { Wrench, Edit2, Trash2 } from 'lucide-react';

export default function HerramientasInventario({ herramientas, onEdit, onDelete, user, onAssignCuadrilla, emptyMessage = 'No hay herramientas registradas' }) {
  const getDisplayEstado = (herramienta) => {
    const stock = Number(herramienta?.stock ?? 0);
    const estado = (herramienta?.estado || '').toLowerCase();
    if (stock <= 0 || ['malo', 'dañado'].includes(estado)) {
      return 'no-disponible';
    }
    return 'disponible';
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'disponible':
        return 'estado-disponible';
      case 'no-disponible':
        return 'estado-no-disponible';
      default:
        return '';
    }
  };

  const getStockStatusClass = (stock) => {
    const stockValue = Number(stock ?? 0);
    const optimalStock = 100;
    const halfOptimal = optimalStock / 2;

    if (stockValue < 10) return 'sin-stock';
    if (stockValue < halfOptimal) return 'bajo-stock';
    return 'stock-optimo';
  };

  return (
    <div className="inventario-container">
      <div className="inventario-header">
        <h2>Detalle de Existencias</h2>
        <div className="inventario-filters">
          {user?.role_id === 1 && (
            <button className="btn-outline" onClick={onAssignCuadrilla}>
              Asignar a Cuadrilla
            </button>
          )}
        </div>
      </div>

      <div className="inventario-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>NOMBRE</th>
              <th>STOCK ACTUAL</th>
              <th>CATEGORÍA</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {herramientas && herramientas.length > 0 ? (
              herramientas.map((herramienta) => (
                <tr key={herramienta.id}>
                  <td className="id-cell">#{herramienta.id}</td>
                  <td className="nombre-cell">
                    <div className="nombre-icon"><Wrench size={20} /></div>
                    <div className="nombre-info">
                      <div className="nombre">{herramienta.nombre}</div>
                      <div className="descripcion">{herramienta.descripcion}</div>
                    </div>
                  </td>
                  <td className={`stock-cell ${getStockStatusClass(herramienta.stock)}`}>
                    {herramienta.stock} <span className="stock-unit">unid</span>
                  </td>
                  <td>{herramienta.categoria_herramienta}</td>
                  <td>
                    <span className={`estado-badge ${getEstadoClass(getDisplayEstado(herramienta))}`}>
                      {getDisplayEstado(herramienta)}
                    </span>
                  </td>
                  <td className="acciones-cell">
                    {user?.role_id === 1 ? (
                      <>
                        <button
                          className="btn-editar"
                          onClick={() => onEdit(herramienta)}
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-eliminar"
                          onClick={() => onDelete(herramienta.id)}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    ) : null}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="sin-datos">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
