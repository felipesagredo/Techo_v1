import React, { useEffect, useState } from 'react';
import { useGetMateriales } from '../features/cuadrillas/hooks/materiales/useGetMaterial';
import { useDeleteMaterial } from '../features/cuadrillas/hooks/materiales/useDeleteMaterial';
import MaterialesInventario from '../features/cuadrillas/components/MaterialesInventario';
import MaterialesPopup from '../components/Materiales.Popup';
import AsignarCuadrillaMaterialPopup from '../components/AsignarCuadrillaMaterial.Popup';
import { Search, X } from 'lucide-react';
import '../styles/Herramientas.css';

export default function Materiales({ user }) {
  const [showPopup, setShowPopup] = useState(false);
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [popupMode, setPopupMode] = useState('create');
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleCloseAssignPopup = () => {
    setShowAssignPopup(false);
  };

  const handleSaveSuccess = () => {
    refetch();
    handleClosePopup();
  };

  const handleAssignSuccess = () => {
    refetch();
    handleCloseAssignPopup();
  };

  const totalMateriales = materiales?.length || 0;
  const cantidadTotal = materiales?.reduce((acc, material) => acc + (Number(material.cantidad) || 0), 0) || 0;
  const pesoTotal = materiales?.reduce((acc, material) => acc + (Number(material.peso) || 0), 0) || 0;
  const porReponer = materiales?.filter((material) => Number(material.cantidad) === 0).length || 0;
  const materialesFiltrados = materiales?.filter((material) => {
    const nombre = material.nombre_material || '';
    return nombre.toLowerCase().includes(searchTerm.trim().toLowerCase());
  }) || [];

  return (
    <div className="herramientas-container">
      <div className="herramientas-header">
        <h1>Materiales</h1>
      </div>

      <div className="materials-search-bar">
        <div className="materials-search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre del material..."
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

      {user?.role_id === 1 && (
        <div className="herramientas-actions">
          <button className="btn-nuevo-registro" onClick={handleOpenPopup}>
            + Nuevo Registro
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">Cargando materiales...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <MaterialesInventario
          materiales={materialesFiltrados}
          user={user}
          onEdit={handleEditMaterial}
          onDelete={handleDeleteMaterial}
          onAssignCuadrilla={() => setShowAssignPopup(true)}
          emptyMessage={searchTerm.trim()
            ? 'No se encontraron materiales con ese nombre'
            : 'No hay materiales registrados'}
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

      {showAssignPopup && (
        <AsignarCuadrillaMaterialPopup
          materiales={materiales}
          onClose={handleCloseAssignPopup}
          onSaveSuccess={handleAssignSuccess}
        />
      )}
    </div>
  );
}