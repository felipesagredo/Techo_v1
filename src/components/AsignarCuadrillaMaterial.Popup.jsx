import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import { cuadrillaService } from '../features/cuadrillas/services/cuadrillaService';
import '../styles/HerramientasPopup.css';

export default function AsignarCuadrillaMaterialPopup({ onClose, onSaveSuccess }) {
  const [selectedCuadrillaId, setSelectedCuadrillaId] = useState('');
  const [cuadrillas, setCuadrillas] = useState([]);
  const [missingMaterials, setMissingMaterials] = useState([]);
  
  const [loadingCuadrillas, setLoadingCuadrillas] = useState(true);
  const [loadingMissing, setLoadingMissing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Cargar recursos faltantes al seleccionar una cuadrilla
  useEffect(() => {
    if (!selectedCuadrillaId) {
      setMissingMaterials([]);
      return;
    }

    const fetchFaltantes = async () => {
      try {
        setLoadingMissing(true);
        const res = await cuadrillaService.getRecursosFaltantes(selectedCuadrillaId);
        setMissingMaterials(res.missingMaterials || []);
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar los materiales faltantes.', 'error');
      } finally {
        setLoadingMissing(false);
      }
    };

    fetchFaltantes();
  }, [selectedCuadrillaId]);

  const handleRellenar = async (e) => {
    e.preventDefault();
    if (!selectedCuadrillaId) {
      Swal.fire('Atención', 'Debe seleccionar una cuadrilla.', 'warning');
      return;
    }

    const totalFaltantes = missingMaterials.reduce((acc, m) => acc + m.faltante, 0);
    if (totalFaltantes === 0) {
      Swal.fire('Información', 'La cuadrilla ya tiene todos los materiales de medias aguas cubiertos.', 'info');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await cuadrillaService.rellenarMateriales(selectedCuadrillaId);
      
      Swal.fire({
        icon: 'success',
        title: 'Materiales Asignados',
        text: 'Se han rellenado los materiales faltantes para la cuadrilla con éxito.',
        timer: 2000,
        showConfirmButton: false
      });
      onSaveSuccess();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.message || 'No se pudo realizar la asignación de materiales.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCuadrilla = cuadrillas.find(c => c.id === parseInt(selectedCuadrillaId, 10));

  return (
    <div className="herramientas-modal-overlay" onClick={onClose}>
      <div className="herramientas-modal" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="herramientas-modal-header">
          <h2>Equipar Materiales a Cuadrilla</h2>
          <button type="button" className="herramientas-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleRellenar} className="herramientas-modal-body popup-form">
          {/* Selección de Cuadrilla */}
          <div className="form-group">
            <label htmlFor="cuadrilla-select">
              Seleccionar Cuadrilla Destino <span className="required">*</span>
            </label>
            <select
              id="cuadrilla-select"
              value={selectedCuadrillaId}
              onChange={(e) => setSelectedCuadrillaId(e.target.value)}
              disabled={loadingCuadrillas || isSubmitting}
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

          {selectedCuadrillaId && (
            <div style={{ marginTop: '1.2rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#004785', marginBottom: '0.8rem' }}>
                Estado de Materiales: {selectedCuadrilla?.nombre}
              </h3>

              {loadingMissing ? (
                <div style={{ textAlign: 'center', padding: '15px 0', color: '#6c757d' }}>
                  <RefreshCw className="spinner" size={24} style={{ animation: 'spin 1s linear infinite' }} />
                  <p style={{ marginTop: '5px', fontSize: '0.85rem' }}>Calculando materiales faltantes...</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8f9fa', padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                    {missingMaterials.map((m, idx) => {
                      const isComplete = m.faltante === 0;
                      return (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', paddingBottom: '6px', borderBottom: idx < missingMaterials.length - 1 ? '1px dashed #dee2e6' : 'none' }}>
                          <span style={{ fontWeight: '500', color: '#495057' }}>
                            📦 {m.nombre}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                              Asignados: {m.asignado} / {m.requerido}
                            </span>
                            {isComplete ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#2ecc71', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                <CheckCircle size={14} /> Cubierto
                              </span>
                            ) : (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#e67e22', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                <AlertTriangle size={14} /> Falta: {m.faltante}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#6c757d', marginTop: '0.8rem', lineHeight: '1.4' }}>
                    * Al presionar "Rellenar Materiales", el sistema asignará automáticamente la cantidad faltante de cada material de construcción para cumplir con el estándar.
                  </p>
                </>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="popup-actions" style={{ marginTop: '1.5rem' }}>
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
              disabled={isSubmitting || !selectedCuadrillaId || loadingMissing}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isSubmitting ? 'Rellenando...' : 'Rellenar Materiales Faltantes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
