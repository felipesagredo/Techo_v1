import React, { useState, useEffect } from 'react';
import { useGetHerramientas } from '../features/cuadrillas/hooks/herramientas/useGetHerramienta';
import { useDeleteHerramienta } from '../features/cuadrillas/hooks/herramientas/useDeleteHerramienta';
import HerramientasInventario from '../features/cuadrillas/components/HerramientasInventario';
import HerramientasPopup from '../components/Herramientas.Popup';
import '../styles/Herramientas.css';

export default function Herramientas({ user }) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState('create');
  const [editingHerramienta, setEditingHerramienta] = useState(null);
  const { herramientas, loading, error, refetch } = useGetHerramientas();
  const { deleteHerramienta } = useDeleteHerramienta();

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

  // Calcular estadísticas
  const totalHerramientas = herramientas?.length || 0;
  const disponibles = herramientas?.filter(h => h.estado === 'disponible').length || 0;
  const bajoStock = herramientas?.filter(h => h.stock <= 5).length || 0;
  const porReponer = herramientas?.filter(h => h.stock === 0).length || 0;
  const optimo = totalHerramientas > 0 ? Math.round((disponibles / totalHerramientas) * 100) : 0;

  return (
    <div className="herramientas-container">
      <div className="herramientas-header">
        <h1>Herramientas</h1>
      </div>

      {/* Estadísticas */}
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
      <div className="herramientas-actions">
        <button className="btn-primary" onClick={handleOpenPopup}>
          + Nuevo Registro
        </button>
      </div>

      {/* Inventario */}
      {loading ? (
        <div className="loading">Cargando herramientas...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
          <HerramientasInventario
            herramientas={herramientas}
            user={user}
            onEdit={handleEditHerramienta}
            onDelete={handleDeleteHerramienta}
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
    </div>
  );
}
