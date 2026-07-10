import React, { useEffect, useState } from 'react';
import { useCreateMaterial } from '../features/cuadrillas/hooks/materiales/useCreateMaterial';
import { useUpdateMaterial } from '../features/cuadrillas/hooks/materiales/useUpdateMaterial';
import { ALLOWED_MATERIALES, buildWhitelistRegex } from '../constants/inventarioWhitelist';
import '../styles/HerramientasPopup.css';

const NOMBRE_MATERIAL_REGEX = buildWhitelistRegex(ALLOWED_MATERIALES);

export default function MaterialesPopup({ material, mode = 'create', onClose, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    nombre_material: '',
    cantidad: '',
    categoria: 'construccion',
    largo: '',
    ancho: '',
    peso: '',
    estado: 'disponible'
  });
  const [nombreError, setNombreError] = useState('');

  const { handleCreateMaterial, loading: createLoading } = useCreateMaterial();
  const { handleUpdateMaterial, loading: updateLoading } = useUpdateMaterial();

  useEffect(() => {
    if (mode === 'edit' && material) {
      setFormData({
        nombre_material: material.nombre_material || '',
        cantidad: material.cantidad ?? '',
        categoria: material.categoria || 'construccion',
        largo: material.largo ?? '',
        ancho: material.ancho ?? '',
        peso: material.peso ?? '',
        estado: material.estado || 'disponible'
      });
    } else {
      setFormData({
        nombre_material: '',
        cantidad: '',
        categoria: 'construccion',
        largo: '',
        ancho: '',
        peso: '',
        estado: 'disponible'
      });
    }
  }, [material, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'cantidad' || name === 'largo' || name === 'ancho' || name === 'peso'
        ? value === '' ? '' : Number(value)
        : value
    }));

    if (name === 'nombre_material') {
      setNombreError(
        value.trim() && !NOMBRE_MATERIAL_REGEX.test(value.trim())
          ? 'Selecciona un nombre de la lista de materiales permitidos.'
          : ''
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!NOMBRE_MATERIAL_REGEX.test(formData.nombre_material.trim())) {
      setNombreError('Selecciona un nombre de la lista de materiales permitidos.');
      return;
    }

    const payload = {
      nombre_material: formData.nombre_material,
      cantidad: Number(formData.cantidad),
      categoria: formData.categoria,
      largo: formData.largo === '' ? undefined : Number(formData.largo),
      ancho: formData.ancho === '' ? undefined : Number(formData.ancho),
      peso: Number(formData.peso)
    };

    if (mode === 'edit') {
      payload.estado = formData.estado;
    }

    const response = mode === 'edit'
      ? await handleUpdateMaterial(material.id, payload)
      : await handleCreateMaterial(payload);

    if (response?.status === 'Success') {
      onSaveSuccess();
    }
  };

  return (
    <div className="herramientas-modal-overlay">
      <div className="herramientas-modal" onClick={(e) => e.stopPropagation()}>
        <div className="herramientas-modal-header">
          <h2>{mode === 'edit' ? 'Editar Material' : 'Nuevo Material'}</h2>
          <button type="button" className="herramientas-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="herramientas-modal-body">
          <form onSubmit={handleSubmit} className="popup-form">
            <div className="form-group">
              <label htmlFor="nombre_material">Nombre *</label>
              <input
                id="nombre_material"
                type="text"
                name="nombre_material"
                list="materiales-permitidos"
                value={formData.nombre_material}
                onChange={handleChange}
                placeholder="Ej: Cemento Portland"
                autoComplete="off"
                required
                aria-invalid={!!nombreError}
              />
              <datalist id="materiales-permitidos">
                {ALLOWED_MATERIALES.map(nombre => (
                  <option key={nombre} value={nombre} />
                ))}
              </datalist>
              {nombreError && (
                <p className="field-error" style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {nombreError}
                </p>
              )}
              <div className="whitelist-hint">
                <strong>Materiales permitidos:</strong>
                <ul>
                  {ALLOWED_MATERIALES.map(nombre => (
                    <li key={nombre}>{nombre}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="cantidad">Cantidad *</label>
                <input
                  id="cantidad"
                  type="number"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoria">Categoría *</label>
                <select
                  id="categoria"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  required
                >
                  <option value="construccion">Construcción</option>
                  <option value="fijador">Fijador</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="largo">Largo</label>
                <input
                  id="largo"
                  type="number"
                  name="largo"
                  value={formData.largo}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label htmlFor="ancho">Ancho</label>
                <input
                  id="ancho"
                  type="number"
                  name="ancho"
                  value={formData.ancho}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="peso">Peso (kg) *</label>
                <input
                  id="peso"
                  type="number"
                  name="peso"
                  value={formData.peso}
                  onChange={handleChange}
                  placeholder="0 kg"
                  min="0"
                  step="0.01"
                  required
                />
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
            </div>

            <div className="popup-actions">
              <button type="button" className="btn-cancelar" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-guardar"
                disabled={createLoading || updateLoading || !NOMBRE_MATERIAL_REGEX.test(formData.nombre_material.trim())}
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