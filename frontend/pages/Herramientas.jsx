import React, { useState, useEffect } from 'react';
import { useGetHerramientas } from '../features/cuadrillas/hooks/herramientas/useGetHerramienta';
import { useDeleteHerramienta } from '../features/cuadrillas/hooks/herramientas/useDeleteHerramienta';
import HerramientasInventario from '../features/cuadrillas/components/HerramientasInventario';
import HerramientasPopup from '../components/Herramientas.Popup';
import AsignarCuadrillaPopup from '../components/AsignarCuadrilla.Popup';
import RestockPopup from '../components/RestockPopup';
import { Search, X, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Herramientas.css';

export default function Herramientas({ user }) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState('create');
  const [editingHerramienta, setEditingHerramienta] = useState(null);
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [showRestockPopup, setShowRestockPopup] = useState(false);
  const { herramientas, loading, error, refetch } = useGetHerramientas();
  const { deleteHerramienta } = useDeleteHerramienta();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    refetch();
  }, []);

  const handleOpenPopup = () => {
    setEditingHerramienta(null);
    setPopupMode('create');
    setShowPopup(true);
  };

  const handleEditHerramienta = (herramienta) => {
    setEditingHerramienta(herramienta);
    setPopupMode('edit');
    setShowPopup(true);
  };

  const handleDeleteHerramienta = async (id) => {
    const result = await Swal.fire({
      title: 'Eliminar herramienta',
      text: '¿Estás seguro de que deseas eliminar esta herramienta? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      reverseButtons: true,
      customClass: {
        popup: 'premium-swal-popup',
        confirmButton: 'premium-swal-confirm-btn'
      }
    });

    if (result.isConfirmed) {
      await deleteHerramienta(id);
      refetch();
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingHerramienta(null);
    setPopupMode('create');
  };

  const handleSaveSuccess = () => {
    refetch();
    handleClosePopup();
  };

  const handleOpenAssignPopup = () => {
    setShowAssignPopup(true);
  };

  const handleCloseAssignPopup = () => {
    setShowAssignPopup(false);
  };

  const handleAssignSuccess = () => {
    refetch();
    handleCloseAssignPopup();
  };

  // Calcular estadísticas
  const totalHerramientas = herramientas?.length || 0;
  const disponibles = herramientas?.filter(h => Number(h.stock ?? 0) > 0 && !['malo', 'dañado'].includes((h.estado || '').toLowerCase())).length || 0;
  const bajoStock = herramientas?.filter(h => Number(h.stock ?? 0) > 0 && Number(h.stock ?? 0) < 50).length || 0;
  const porReponer = herramientas?.filter(h => Number(h.stock ?? 0) === 0).length || 0;
  const optimasCount = herramientas?.filter(h => Number(h.stock ?? 0) >= 50 && !['malo', 'dañado'].includes((h.estado || '').toLowerCase())).length || 0;
  const optimo = totalHerramientas > 0 ? Math.round((optimasCount / totalHerramientas) * 100) : 0;
  const herramientasFiltradas = herramientas?.filter((h) => {
    const nombre = h.nombre || '';
    const id = String(h.id ?? '');
    const term = searchTerm.trim().toLowerCase();
    return nombre.toLowerCase().includes(term) || id.includes(searchTerm.trim());
  }) || [];

  return (
    <div className="herramientas-container">
      <div className="herramientas-header">
        <h1>Herramientas</h1>
      </div>

      {/* Estadísticas */}
      <div className="materials-search-bar">
        <div className="materials-search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o ID de herramienta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="materials-search-clear"
              onClick={() => setSearchTerm('')}
              aria-label="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">TOTAL ITEMS</div>
          <div className="stat-value">{totalHerramientas}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">ÓPTIMO</div>
          <div className="stat-value">{optimo}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">BAJO STOCK</div>
          <div className="stat-value">{bajoStock}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">POR REPONER</div>
          <div className="stat-value">{porReponer}</div>
        </div>
      </div>

      {/* Botón Nuevo Registro */}
      {user?.role_id === 1 && (
        <div className="herramientas-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={handleOpenPopup}>
            <Plus size={16} /> Agregar Herramienta
          </button>
          <button className="btn-secondary" onClick={() => setShowRestockPopup(true)} style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
            <Plus size={16} /> Registrar Entrada Stock
          </button>
        </div>
      )}

      {/* Inventario */}
      {loading ? (
        <div className="loading">Cargando herramientas...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
          <HerramientasInventario
            herramientas={herramientasFiltradas}
            user={user}
            onEdit={handleEditHerramienta}
            onDelete={handleDeleteHerramienta}
            onAssignCuadrilla={handleOpenAssignPopup}
            emptyMessage={searchTerm.trim() ? 'No se encontraron herramientas con ese nombre o ID' : 'No hay herramientas registradas'}
          />
      )}

      {/* Popup */}
      {showPopup && (
        <HerramientasPopup
          herramienta={editingHerramienta}
          mode={popupMode}
          onClose={handleClosePopup}
          onSaveSuccess={handleSaveSuccess}
        />
      )}

      {/* Asignar a Cuadrilla Popup */}
      {showAssignPopup && (
        <AsignarCuadrillaPopup
          herramientas={herramientas}
          onClose={handleCloseAssignPopup}
          onSaveSuccess={handleAssignSuccess}
        />
      )}

      {/* Registrar Entrada Stock Popup */}
      {showRestockPopup && (
        <RestockPopup
          tipoInicial="herramienta"
          onClose={() => setShowRestockPopup(false)}
          onSuccess={() => {
            setShowRestockPopup(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
