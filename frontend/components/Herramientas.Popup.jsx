import React, { useState, useEffect } from 'react';
import { useCreateHerramienta } from '../features/cuadrillas/hooks/herramientas/useCreateHerramienta';
import { useUpdateHerramienta } from '../features/cuadrillas/hooks/herramientas/useUpdateHerramienta';
import { ALLOWED_HERRAMIENTAS, buildWhitelistRegex } from '../constants/inventarioWhitelist';
import '../styles/HerramientasPopup.css';

const NOMBRE_HERRAMIENTA_REGEX = buildWhitelistRegex(ALLOWED_HERRAMIENTAS);

export default function HerramientasPopup({ herramienta, mode = 'create', onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    stock: '',
    categoria_herramienta: 'manual',
    estado: 'disponible'
  });
  const [nombreError, setNombreError] = useState('');

  const { handleCreateHerramienta, loading: createLoading } = useCreateHerramienta();
  const { handleUpdateHerramienta, loading: updateLoading } = useUpdateHerramienta();

  useEffect(() => {
    if (mode === 'edit' && herramienta) {
      setFormData({
        nombre: herramienta.nombre,
        descripcion: herramienta.descripcion,
        stock: herramienta.stock,
        categoria_herramienta: herramienta.categoria_herramienta,
        estado: herramienta.estado
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        stock: '',
        categoria_herramienta: 'manual',
        estado: 'disponible'
      });
    }
  }, [herramienta, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'stock' ? parseInt(value) || 0 : value
    }));

    if (name === 'nombre') {
      setNombreError(
        value.trim() && !NOMBRE_HERRAMIENTA_REGEX.test(value.trim())
          ? 'Selecciona un nombre de la lista de herramientas permitidas.'
          : ''
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!NOMBRE_HERRAMIENTA_REGEX.test(formData.nombre.trim())) {
      setNombreError('Selecciona un nombre de la lista de herramientas permitidas.');
      return;
    }

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
    <div className="herramientas-modal-overlay">
      <div className="herramientas-modal" onClick={(e) => e.stopPropagation()}>
        <div className="herramientas-modal-header">
          <h2>{mode === 'edit' ? 'Editar Herramienta' : 'Nueva Herramienta'}</h2>
          <button type="button" className="herramientas-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="herramientas-modal-body">
          <form onSubmit={handleSubmit} className="popup-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre *</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              list="herramientas-permitidas"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Martillo"
              autoComplete="off"
              required
              aria-invalid={!!nombreError}
            />
            <datalist id="herramientas-permitidas">
              {ALLOWED_HERRAMIENTAS.map(nombre => (
                <option key={nombre} value={nombre} />
              ))}
            </datalist>
            {nombreError && (
              <p className="field-error" style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {nombreError}
              </p>
            )}
            <div className="whitelist-hint">
              <strong>Herramientas permitidas:</strong>
              <ul>
                {ALLOWED_HERRAMIENTAS.map(nombre => (
                  <li key={nombre}>{nombre}</li>
                ))}
              </ul>
            </div>
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
            <button
              type="submit"
              className="btn-guardar"
              disabled={createLoading || updateLoading || !NOMBRE_HERRAMIENTA_REGEX.test(formData.nombre.trim())}
            >
              {createLoading || updateLoading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
