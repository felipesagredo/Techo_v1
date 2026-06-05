import React from 'react';
import '../../../styles/HerramientasInventario.css';
import { Wrench, Edit2, Trash2 } from 'lucide-react';

export default function HerramientasInventario({ herramientas, onEdit, onDelete, user }) {
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

  const getStockStatus = (stock) => {
    if (stock === 0) return 'sin-stock';
    if (stock <= 5) return 'bajo-stock';
    return 'stock-ok';
  };

  return (
    <div className="inventario-container">
      <div className="inventario-header">
        <h2>Detalle de Existencias</h2>
        <div className="inventario-filters">
          <button className="filter-btn">Filtro</button>
          <button className="export-btn">Exportar</button>
        </div>
      </div>

      <div className="inventario-table">
        <table>
          <thead>
            <tr>
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
                  <td className="nombre-cell">
                    <div className="nombre-icon"><Wrench size={20} /></div>
                    <div className="nombre-info">
                      <div className="nombre">{herramienta.nombre}</div>
                      <div className="descripcion">{herramienta.descripcion}</div>
                    </div>
                  </td>
                  <td className={`stock-cell ${getStockStatus(herramienta.stock)}`}>
                    {herramienta.stock} <span className="stock-unit">unid</span>
                  </td>
                  <td>{herramienta.categoria_herramienta}</td>
                  <td>
                    <span className={`estado-badge ${getEstadoClass(herramienta.estado)}`}>
                      {herramienta.estado}
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
                <td colSpan="5" className="sin-datos">
                  No hay herramientas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
