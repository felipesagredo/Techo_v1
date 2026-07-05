import React, { useState, useEffect } from 'react';
import { useGetHerramientas } from '../features/cuadrillas/hooks/herramientas/useGetHerramienta';
import { useDeleteHerramienta } from '../features/cuadrillas/hooks/herramientas/useDeleteHerramienta';
import HerramientasInventario from '../features/cuadrillas/components/HerramientasInventario';
import HerramientasPopup from '../components/Herramientas.Popup';
import AsignarCuadrillaPopup from '../components/AsignarCuadrilla.Popup';
import { Search, X } from 'lucide-react';
import '../styles/Herramientas.css';

export default function Herramientas({ user }) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState('create');
  const [editingHerramienta, setEditingHerramienta] = useState(null);
  const [showAssignPopup, setShowAssignPopup] = useState(false);
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
    if (window.confirm('¿Estás seguro de que deseas eliminar esta herramienta?')) {
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
    return nombre.toLowerCase().includes(searchTerm.trim().toLowerCase());
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
            placeholder="Buscar por nombre de herramienta..."
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
        <div className="herramientas-actions">
          <button className="btn-nuevo-registro" onClick={handleOpenPopup}>
            + Nuevo Registro
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
            emptyMessage={searchTerm.trim() ? 'No se encontraron herramientas con ese nombre' : 'No hay herramientas registradas'}
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
    </div>
  );
}
