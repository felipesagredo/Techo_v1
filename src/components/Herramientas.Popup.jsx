import React, { useState, useEffect } from 'react';
import { useCreateHerramienta } from '../features/cuadrillas/hooks/herramientas/useCreateHerramienta';
import { useUpdateHerramienta } from '../features/cuadrillas/hooks/herramientas/useUpdateHerramienta';
import '../styles/HerramientasPopup.css';

export default function HerramientasPopup({ herramienta, onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    stock: '',
    categoria_herramienta: 'manual',
    estado: 'disponible'
  });

  const { handleCreateHerramienta, loading: createLoading } = useCreateHerramienta();
  const { handleUpdateHerramienta, loading: updateLoading } = useUpdateHerramienta();

  useEffect(() => {
    if (herramienta) {
      setFormData({
        nombre: herramienta.nombre,
        descripcion: herramienta.descripcion,
        stock: herramienta.stock,
        categoria_herramienta: herramienta.categoria_herramienta,
        estado: herramienta.estado
      });
    }
  }, [herramienta]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (herramienta) {
        const response = await handleUpdateHerramienta(herramienta.id, formData);
        if (response?.status === 'Success') {
          onSaveSuccess();
        }
      } else {
        const response = await handleCreateHerramienta(formData);
        if (response?.status === 'Success') {
          onSaveSuccess();
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h2>{herramienta ? 'Editar Herramienta' : 'Nueva Herramienta'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="popup-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Martillo"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Ej: Martillo de goma para trabajo liviano"
              required
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stock">Stock *</label>
              <input
                id="stock"
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="categoria_herramienta">Categoría *</label>
              <select
                id="categoria_herramienta"
                name="categoria_herramienta"
                value={formData.categoria_herramienta}
                onChange={handleChange}
                required
              >
                <option value="manual">Manual</option>
                <option value="electrica">Eléctrica</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            >
              <option value="disponible">Disponible</option>
              <option value="no-disponible">No Disponible</option>
            </select>
          </div>

          <div className="popup-actions">
            <button type="button" className="btn-cancelar" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-guardar" disabled={createLoading || updateLoading}>
              {createLoading || updateLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
