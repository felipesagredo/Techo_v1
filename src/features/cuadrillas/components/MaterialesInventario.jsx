import React from 'react';
import '../../../styles/HerramientasInventario.css';
import { Package, Edit2, Trash2 } from 'lucide-react';

export default function MaterialesInventario({ materiales, onEdit, onDelete, user, emptyMessage = 'No hay materiales registrados' }) {
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

  const getCantidadStatus = (cantidad) => {
    if (cantidad === 0) return 'sin-stock';
    if (cantidad <= 5) return 'bajo-stock';
    return 'stock-ok';
  };

  return (
    <div className="inventario-container">
      <div className="inventario-header">
        <h2>Detalle de Materiales</h2>
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
              <th>CANTIDAD</th>
              <th>CATEGORÍA</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {materiales && materiales.length > 0 ? (
              materiales.map((material) => (
                <tr key={material.id}>
                  <td className="nombre-cell">
                    <div className="nombre-icon"><Package size={20} /></div>
                    <div className="nombre-info">
                      <div className="nombre">{material.nombre_material}</div>
                      <div className="descripcion">
                        {material.largo || material.ancho || material.peso
                          ? `Largo: ${material.largo ?? '-'} | Ancho: ${material.ancho ?? '-'} | Peso: ${material.peso ?? '-'} kg`
                          : 'Material registrado'}
                      </div>
                    </div>
                  </td>
                  <td className={`stock-cell ${getCantidadStatus(material.cantidad)}`}>
                    {material.cantidad} <span className="stock-unit">unid</span>
                  </td>
                  <td>{material.categoria}</td>
                  <td>
                    <span className={`estado-badge ${getEstadoClass(material.estado)}`}>
                      {material.estado || 'disponible'}
                    </span>
                  </td>
                  <td className="acciones-cell">
                    {user?.role_id === 1 ? (
                      <>
                        <button
                          className="btn-editar"
                          onClick={() => onEdit(material)}
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-eliminar"
                          onClick={() => onDelete(material.id)}
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