import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';
import { cuadrillaService } from '../features/cuadrillas/services/cuadrillaService';
import '../styles/HerramientasPopup.css';

export default function AsignarCuadrillaPopup({ herramientas, onClose, onSaveSuccess }) {
  const [selectedHerramientaId, setSelectedHerramientaId] = useState('');
  const [selectedCuadrillaId, setSelectedCuadrillaId] = useState('');
  const [selectedVoluntarioId, setSelectedVoluntarioId] = useState('');
  const [notas, setNotas] = useState('');
  
  const [cuadrillas, setCuadrillas] = useState([]);
  const [miembros, setMiembros] = useState([]);
  
  const [loadingCuadrillas, setLoadingCuadrillas] = useState(true);
  const [loadingMiembros, setLoadingMiembros] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar herramientas disponibles
  const availableTools = herramientas?.filter(h => h.estado === 'disponible' && h.stock > 0) || [];

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

  // Cargar miembros al seleccionar una cuadrilla
  useEffect(() => {
    if (!selectedCuadrillaId) {
      setMiembros([]);
      setSelectedVoluntarioId('');
      return;
    }
    const fetchMiembros = async () => {
      try {
        setLoadingMiembros(true);
        const data = await cuadrillaService.getMembers(selectedCuadrillaId);
        setMiembros(data || []);
        if (data && data.length > 0) {
          setSelectedVoluntarioId(data[0].user_id);
        } else {
          setSelectedVoluntarioId('');
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar los miembros de la cuadrilla.', 'error');
      } finally {
        setLoadingMiembros(false);
      }
    };
    fetchMiembros();
  }, [selectedCuadrillaId]);

  // Generar nota por defecto al elegir cuadrilla
  useEffect(() => {
    if (selectedCuadrillaId && cuadrillas.length > 0) {
      const selectedCuadrilla = cuadrillas.find(c => c.id === parseInt(selectedCuadrillaId, 10));
      if (selectedCuadrilla) {
        setNotas(`Asignación manual a cuadrilla: ${selectedCuadrilla.nombre}`);
      }
    } else {
      setNotas('');
    }
  }, [selectedCuadrillaId, cuadrillas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHerramientaId) {
      Swal.fire('Atención', 'Debe seleccionar una herramienta disponible.', 'warning');
      return;
    }
    if (!selectedCuadrillaId) {
      Swal.fire('Atención', 'Debe seleccionar una cuadrilla.', 'warning');
      return;
    }
    if (!selectedVoluntarioId) {
      Swal.fire('Atención', 'La cuadrilla seleccionada no tiene miembros a quienes asignar la herramienta.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/herramientas/prestamos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          herramientaId: parseInt(selectedHerramientaId, 10),
          userId: parseInt(selectedVoluntarioId, 10),
          notas: notas.trim()
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.status === 'Success') {
        Swal.fire({
          icon: 'success',
          title: 'Asignación Exitosa',
          text: 'La herramienta ha sido asignada al miembro de la cuadrilla.',
          timer: 2000,
          showConfirmButton: false
        });
        onSaveSuccess();
      } else {
        Swal.fire('Error', data.error || 'No se pudo realizar la asignación de la herramienta.', 'error');
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
          <h2>Asignar Herramienta a Cuadrilla</h2>
          <button type="button" className="herramientas-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="herramientas-modal-body popup-form">
          {/* Selección de Herramienta */}
          <div className="form-group">
            <label htmlFor="herramienta-select">
              Seleccionar Herramienta <span className="required">*</span>
            </label>
            <select
              id="herramienta-select"
              value={selectedHerramientaId}
              onChange={(e) => setSelectedHerramientaId(e.target.value)}
              required
            >
              <option value="">-- Selecciona una herramienta disponible --</option>
              {availableTools.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.nombre} ({h.categoria_herramienta}) - Stock: {h.stock}
                </option>
              ))}
            </select>
            {availableTools.length === 0 && (
              <small style={{ color: '#dc3545' }}>No hay herramientas disponibles en el inventario.</small>
            )}
          </div>

          {/* Selección de Cuadrilla */}
          <div className="form-group">
            <label htmlFor="cuadrilla-select">
              Seleccionar Cuadrilla <span className="required">*</span>
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

          {/* Selección de Miembro de la Cuadrilla */}
          <div className="form-group">
            <label htmlFor="miembro-select">
              Responsable de la Herramienta (Miembro) <span className="required">*</span>
            </label>
            <select
              id="miembro-select"
              value={selectedVoluntarioId}
              onChange={(e) => setSelectedVoluntarioId(e.target.value)}
              disabled={!selectedCuadrillaId || loadingMiembros}
              required
            >
              {!selectedCuadrillaId ? (
                <option value="">-- Selecciona primero una cuadrilla --</option>
              ) : loadingMiembros ? (
                <option value="">Cargando miembros...</option>
              ) : miembros.length === 0 ? (
                <option value="">No hay miembros asignados a esta cuadrilla</option>
              ) : (
                miembros.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.name} ({m.cargo})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Notas de Asignación */}
          <div className="form-group">
            <label htmlFor="notas-textarea">Notas / Observaciones</label>
            <textarea
              id="notas-textarea"
              placeholder="Ej: Asignado para la jornada de construcción en zona sur."
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
              disabled={isSubmitting || availableTools.length === 0}
            >
              {isSubmitting ? 'Asignando...' : 'Asignar Herramienta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
