import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Layers, Edit } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/HerramientasPopup.css';

const API_URL = 'http://localhost:5000/api';

export default function RestockPopup({ tipoInicial = 'material', onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('kit'); // 'kit' or 'manual'
  const [tipo, setTipo] = useState(tipoInicial); // 'material' or 'herramienta'
  const [materialsList, setMaterialsList] = useState([]);
  const [toolsList, setToolsList] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      setLoadingItems(true);
      try {
        const headers = {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        };

        const [resMat, resTool] = await Promise.all([
          fetch(`${API_URL}/materiales`, { headers }),
          fetch(`${API_URL}/herramientas`, { headers })
        ]);

        const dataMat = await resMat.json();
        const dataTool = await resTool.json();

        // Extraer los datos reales de la estructura de respuesta típica (dataMat.data o dataMat)
        setMaterialsList(dataMat.data || dataMat || []);
        setToolsList(dataTool.data || dataTool || []);
      } catch (err) {
        console.error('Error fetching inventory for restock:', err);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchResources();
  }, []);

  const handleLoteKit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/inventario/llegada-lote-kit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await res.json();
      if (res.ok && data.status === 'Success') {
        Swal.fire({
          icon: 'success',
          title: 'Lote Ingresado',
          text: 'Se ha registrado la llegada del Kit Medias Aguas al inventario.',
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

  const currentList = tipo === 'material' ? materialsList : toolsList;

  return (
    <div className="herramientas-modal-overlay" onClick={onClose}>
      <div className="herramientas-modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="herramientas-modal-header">
          <h2>Registrar Entrada de Stock</h2>
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
                Al cargar el lote del <strong>Kit Medias Aguas</strong>, se registrará el ingreso de las siguientes cantidades al inventario:
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', textAlign: 'left', background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div><strong>Herramientas:</strong></div>
                <div><strong>Materiales:</strong></div>
                <div>• Sierras (+10)</div>
                <div>• Planchas de zinc (+100)</div>
                <div>• Martillos (+50)</div>
                <div>• Maderas de constr. (+200)</div>
                <div>• Huinchas (+50)</div>
                <div>• Tablas (+200)</div>
                <div>• Cajas de Clavos (+20)</div>
                <div>• Grava y Arena (+50 c/u)</div>
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
              {/* Selector de Tipo */}
              <div className="form-group">
                <label>Tipo de Recurso</label>
                <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="tipoRecurso"
                      checked={tipo === 'material'}
                      onChange={() => {
                        setTipo('material');
                        setSelectedItemId('');
                      }}
                    />
                    Materiales
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="tipoRecurso"
                      checked={tipo === 'herramienta'}
                      onChange={() => {
                        setTipo('herramienta');
                        setSelectedItemId('');
                      }}
                    />
                    Herramientas
                  </label>
                </div>
              </div>

              {/* Selector de Ítem */}
              <div className="form-group">
                <label htmlFor="item-select">
                  Seleccionar {tipo === 'material' ? 'Material' : 'Herramienta'} <span className="required">*</span>
                </label>
                <select
                  id="item-select"
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  disabled={loadingItems}
                  required
                >
                  <option value="">
                    {loadingItems ? 'Cargando ítems...' : `-- Selecciona un ${tipo === 'material' ? 'material' : 'herramienta'} --`}
                  </option>
                  {currentList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {tipo === 'material' ? item.nombre_material : item.nombre} (Stock actual: {tipo === 'material' ? item.cantidad : item.stock})
                    </option>
                  ))}
                </select>
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
