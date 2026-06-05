import React, { useEffect, useState } from 'react';
import { useGetMateriales } from '../features/cuadrillas/hooks/materiales/useGetMaterial';
import { useDeleteMaterial } from '../features/cuadrillas/hooks/materiales/useDeleteMaterial';
import MaterialesInventario from '../features/cuadrillas/components/MaterialesInventario';
import MaterialesPopup from '../components/Materiales.Popup';
import '../styles/Herramientas.css';

export default function Materiales({ user }) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMode, setPopupMode] = useState('create');
  const [editingMaterial, setEditingMaterial] = useState(null);
  const { materiales, loading, error, refetch } = useGetMateriales();
  const { deleteMaterialById } = useDeleteMaterial();

  useEffect(() => {
    refetch();
  }, []);

  const handleOpenPopup = () => {
    setEditingMaterial(null);
    setPopupMode('create');
    setShowPopup(true);
  };

  const handleEditMaterial = (material) => {
    setEditingMaterial(material);
    setPopupMode('edit');
    setShowPopup(true);
  };

  const handleDeleteMaterial = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este material?')) {
      await deleteMaterialById(id);
      refetch();
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setEditingMaterial(null);
    setPopupMode('create');
  };

  const handleSaveSuccess = () => {
    refetch();
    handleClosePopup();
  };

  const totalMateriales = materiales?.length || 0;
  const cantidadTotal = materiales?.reduce((acc, material) => acc + (Number(material.cantidad) || 0), 0) || 0;
  const pesoTotal = materiales?.reduce((acc, material) => acc + (Number(material.peso) || 0), 0) || 0;
  const porReponer = materiales?.filter((material) => Number(material.cantidad) === 0).length || 0;

  return (
    <div className="herramientas-container">
      <div className="herramientas-header">
        <h1>Materiales</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">TOTAL ITEMS</div>
          <div className="stat-value">{totalMateriales}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">CANTIDAD TOTAL</div>
          <div className="stat-value">{cantidadTotal}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">PESO TOTAL</div>
          <div className="stat-value">{pesoTotal.toFixed(2)} kg</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">POR REPONER</div>
          <div className="stat-value">{porReponer}</div>
        </div>
      </div>

      <div className="herramientas-actions">
        <button className="btn-nuevo-registro" onClick={handleOpenPopup}>
          + Nuevo Registro
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando materiales...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <MaterialesInventario
          materiales={materiales}
          user={user}
          onEdit={handleEditMaterial}
          onDelete={handleDeleteMaterial}
        />
      )}

      {showPopup && (
        <MaterialesPopup
          material={editingMaterial}
          mode={popupMode}
          onClose={handleClosePopup}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
}