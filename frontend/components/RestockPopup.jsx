import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Layers, Edit } from 'lucide-react';
import Swal from 'sweetalert2';
import { ALLOWED_HERRAMIENTAS, ALLOWED_MATERIALES } from '../constants/inventarioWhitelist';
import '../styles/HerramientasPopup.css';

const API_URL = 'http://localhost:5000/api';

// Cantidad que se suma por item al autorizar el kit. Debe coincidir con
// KIT_QTY_HERRAMIENTA / KIT_QTY_MATERIAL en inventarioService.js (backend).
const KIT_QTY_HERRAMIENTA = 20;
const KIT_QTY_MATERIAL = 100;

export default function RestockPopup({ tipoInicial = 'material', onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('kit'); // 'kit' or 'manual'
  const tipo = tipoInicial; // 'material' or 'herramienta' — fijo según la sección de origen
  const [itemsList, setItemsList] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const esMaterial = tipo === 'material';
  const allowedNames = esMaterial ? ALLOWED_MATERIALES : ALLOWED_HERRAMIENTAS;
  // Solo se puede reabastecer stock de items cuyo nombre siga en la lista blanca actual.
  const allowedItemsList = itemsList.filter((item) => {
    const nombre = esMaterial ? item.nombre_material : item.nombre;
    return allowedNames.some((permitido) => permitido.toLowerCase() === (nombre || '').toLowerCase());
  });

  useEffect(() => {
    const fetchResources = async () => {
      setLoadingItems(true);
      try {
        const headers = {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };

        const res = await fetch(`${API_URL}/${esMaterial ? 'materiales' : 'herramientas'}`, { headers });
        const data = await res.json();

        // Extraer los datos reales de la estructura de respuesta típica (data.data o data)
        setItemsList(data.data || data || []);
      } catch (err) {
        console.error('Error fetching inventory for restock:', err);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchResources();
  }, [esMaterial]);

  const handleLoteKit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/inventario/llegada-lote-kit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ tipo })
      });

      const data = await res.json();
      if (res.ok && data.status === 'Success') {
        Swal.fire({
          icon: 'success',
          title: 'Lote Ingresado',
          text: `Se ha registrado la llegada del Kit Medias Aguas (${esMaterial ? 'materiales' : 'herramientas'}) al inventario.`,
          timer: 2500,
          showConfirmButton: false
        });
        onSuccess();
      } else {
        Swal.fire('Error', data.message || 'No se pudo ingresar el lote.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Problema al conectar con el servidor.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManual = async (e) => {
    e.preventDefault();
    if (!selectedItemId) {
      Swal.fire('Atención', 'Debe seleccionar un ítem del inventario.', 'warning');
      return;
    }
    if (cantidad <= 0) {
      Swal.fire('Atención', 'La cantidad debe ser mayor a 0.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/inventario/llegada-manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tipo,
          id: parseInt(selectedItemId, 10),
          cantidad: parseInt(cantidad, 10)
        })
      });

      const data = await res.json();
      if (res.ok && data.status === 'Success') {
        Swal.fire({
          icon: 'success',
          title: 'Stock Actualizado',
          text: 'Se ha registrado el ingreso de stock.',
          timer: 2000,
          showConfirmButton: false
        });
        onSuccess();
      } else {
        Swal.fire('Error', data.message || 'No se pudo actualizar el stock.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Problema al conectar con el servidor.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="herramientas-modal-overlay" onClick={onClose}>
      <div className="herramientas-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="herramientas-modal-header">
          <h2>Registrar Entrada de Stock — {esMaterial ? 'Materiales' : 'Herramientas'}</h2>
          <button type="button" className="herramientas-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Selector de pestañas */}
        <div style={{ display: 'flex', borderBottom: '1px solid #dee2e6', marginBottom: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('kit')}
            style={{
              flex: 1,
              padding: '10px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'kit' ? '3px solid #004785' : 'none',
              fontWeight: activeTab === 'kit' ? 'bold' : 'normal',
              color: activeTab === 'kit' ? '#004785' : '#495057',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Layers size={16} /> Kit Medias Aguas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            style={{
              flex: 1,
              padding: '10px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'manual' ? '3px solid #004785' : 'none',
              fontWeight: activeTab === 'manual' ? 'bold' : 'normal',
              color: activeTab === 'manual' ? '#004785' : '#495057',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Edit size={16} /> Ingreso Individual
          </button>
        </div>

        <div className="herramientas-modal-body popup-form">
          {activeTab === 'kit' ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <p style={{ color: '#495057', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Al cargar el lote del <strong>Kit Medias Aguas</strong>, se registrará el ingreso de las siguientes cantidades de <strong>{esMaterial ? 'materiales' : 'herramientas'}</strong> al inventario:
              </p>

              <div style={{ textAlign: 'left', background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem', maxHeight: '260px', overflowY: 'auto' }}>
                <div style={{ marginBottom: '4px' }}><strong>{esMaterial ? 'Materiales:' : 'Herramientas:'}</strong></div>
                {(esMaterial ? ALLOWED_MATERIALES : ALLOWED_HERRAMIENTAS).map((nombre) => (
                  <div key={nombre}>• {nombre} (+{esMaterial ? KIT_QTY_MATERIAL : KIT_QTY_HERRAMIENTA})</div>
                ))}
              </div>

              <div className="popup-actions" style={{ justifyContent: 'center' }}>
                <button type="button" className="btn-cancelar" onClick={onClose} disabled={isSubmitting}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-guardar"
                  onClick={handleLoteKit}
                  disabled={isSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {isSubmitting ? (
                    <>Cargando lote...</>
                  ) : (
                    <>
                      <RefreshCw size={16} /> Autorizar Carga de Lote
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleManual}>
              {/* Selector de Ítem */}
              <div className="form-group">
                <label htmlFor="item-select">
                  Seleccionar {esMaterial ? 'Material' : 'Herramienta'} <span className="required">*</span>
                </label>
                <select
                  id="item-select"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  disabled={loadingItems}
                  required
                >
                  <option value="">
                    {loadingItems ? 'Cargando ítems...' : `-- Selecciona un ${esMaterial ? 'material' : 'herramienta'} --`}
                  </option>
                  {allowedItemsList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {esMaterial ? item.nombre_material : item.nombre} (Stock actual: {esMaterial ? item.cantidad : item.stock})
                    </option>
                  ))}
                </select>
                {!loadingItems && allowedItemsList.length === 0 && (
                  <p className="field-error" style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    No hay {esMaterial ? 'materiales' : 'herramientas'} de tu lista permitida registrados aún en el inventario.
                  </p>
                )}
              </div>

              {/* Cantidad */}
              <div className="form-group">
                <label htmlFor="cant-input">Cantidad a Ingresar <span className="required">*</span></label>
                <input
                  id="cant-input"
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(Number(e.target.value))}
                  required
                />
              </div>

              {/* Acciones */}
              <div className="popup-actions">
                <button type="button" className="btn-cancelar" onClick={onClose} disabled={isSubmitting}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar" disabled={isSubmitting || loadingItems}>
                  {isSubmitting ? 'Registrando...' : 'Registrar Entrada'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
