import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
import { cuadrillaService } from '../features/cuadrillas/services/cuadrillaService';
import '../styles/HerramientasPopup.css';

export default function AsignarCuadrillaMaterialPopup({ materiales, onClose, onSaveSuccess }) {
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [selectedCuadrillaId, setSelectedCuadrillaId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState('');
  
  const [cuadrillas, setCuadrillas] = useState([]);
  
  const [loadingCuadrillas, setLoadingCuadrillas] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar materiales disponibles (con stock mayor a 0)
  const availableMaterials = materiales?.filter(m => m.estado === 'disponible' && m.cantidad > 0) || [];

  // Encontrar el material seleccionado para saber su stock máximo
  const selectedMaterial = availableMaterials.find(m => m.id === parseInt(selectedMaterialId, 10));
  const maxStock = selectedMaterial ? selectedMaterial.cantidad : 1;

  // Cargar cuadrillas al montar
  useEffect(() => {
    const fetchCuadrillas = async () => {
      try {
        setLoadingCuadrillas(true);
        const data = await cuadrillaService.getAll();
        setCuadrillas(data || []);
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar las cuadrillas.', 'error');
      } finally {
        setLoadingCuadrillas(false);
      }
    };
    fetchCuadrillas();
  }, []);

  // Limitar la cantidad si cambia el material seleccionado
  useEffect(() => {
    if (cantidad > maxStock) {
      setCantidad(maxStock);
    }
    if (cantidad < 1) {
      setCantidad(1);
    }
  }, [selectedMaterialId, maxStock]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMaterialId) {
      Swal.fire('Atención', 'Debe seleccionar un material disponible.', 'warning');
      return;
    }
    if (!selectedCuadrillaId) {
      Swal.fire('Atención', 'Debe seleccionar una cuadrilla.', 'warning');
      return;
    }
    if (cantidad <= 0 || cantidad > maxStock) {
      Swal.fire('Atención', `La cantidad debe ser entre 1 y ${maxStock}.`, 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/materiales/asignaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          materialId: parseInt(selectedMaterialId, 10),
          cuadrillaId: parseInt(selectedCuadrillaId, 10),
          cantidad: parseInt(cantidad, 10),
          notas: notas.trim()
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.status === 'Success') {
        Swal.fire({
          icon: 'success',
          title: 'Asignación Exitosa',
          text: 'Los materiales han sido asignados a la cuadrilla.',
          timer: 2000,
          showConfirmButton: false
        });
        onSaveSuccess();
      } else {
        Swal.fire('Error', data.error || data.message || 'No se pudo realizar la asignación del material.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Hubo un problema de conexión con el servidor.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="herramientas-modal-overlay" onClick={onClose}>
      <div className="herramientas-modal" onClick={(e) => e.stopPropagation()}>
        <div className="herramientas-modal-header">
          <h2>Asignar Material a Cuadrilla</h2>
          <button type="button" className="herramientas-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="herramientas-modal-body popup-form">
          {/* Selección de Material */}
          <div className="form-group">
            <label htmlFor="material-select">
              Seleccionar Material <span className="required">*</span>
            </label>
            <select
              id="material-select"
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              required
            >
              <option value="">-- Selecciona un material disponible --</option>
              {availableMaterials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nombre_material} ({m.categoria}) - Stock: {m.cantidad}
                </option>
              ))}
            </select>
            {availableMaterials.length === 0 && (
              <small style={{ color: '#dc3545' }}>No hay materiales disponibles en el inventario.</small>
            )}
          </div>

          {/* Cantidad a asignar */}
          <div className="form-group">
            <label htmlFor="cantidad-input">
              Cantidad a Asignar <span className="required">*</span>
            </label>
            <input
              type="number"
              id="cantidad-input"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              min="1"
              max={maxStock}
              disabled={!selectedMaterialId}
              required
            />
            {selectedMaterialId && (
              <small style={{ color: '#6c757d' }}>Stock disponible: {maxStock}</small>
            )}
          </div>

          {/* Selección de Cuadrilla */}
          <div className="form-group">
            <label htmlFor="cuadrilla-select">
              Seleccionar Cuadrilla Destino <span className="required">*</span>
            </label>
            <select
              id="cuadrilla-select"
              value={selectedCuadrillaId}
              onChange={(e) => setSelectedCuadrillaId(e.target.value)}
              disabled={loadingCuadrillas}
              required
            >
              <option value="">
                {loadingCuadrillas ? 'Cargando cuadrillas...' : '-- Selecciona una cuadrilla --'}
              </option>
              {cuadrillas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} (Zona: {c.zona})
                </option>
              ))}
            </select>
          </div>

          {/* Notas de Asignación */}
          <div className="form-group">
            <label htmlFor="notas-textarea">Notas / Observaciones</label>
            <textarea
              id="notas-textarea"
              placeholder="Ej: Asignado para la construcción de los pisos."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              maxLength={500}
            />
          </div>

          {/* Acciones */}
          <div className="popup-actions">
            <button
              type="button"
              className="btn-cancelar"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-guardar"
              disabled={isSubmitting || availableMaterials.length === 0}
            >
              {isSubmitting ? 'Asignando...' : 'Asignar Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
