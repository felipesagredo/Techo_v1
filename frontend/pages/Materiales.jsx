import React, { useEffect, useState } from 'react';
import { useGetMateriales } from '../features/cuadrillas/hooks/materiales/useGetMaterial';
import { useDeleteMaterial } from '../features/cuadrillas/hooks/materiales/useDeleteMaterial';
import MaterialesInventario from '../features/cuadrillas/components/MaterialesInventario';
import MaterialesPopup from '../components/Materiales.Popup';
import AsignarCuadrillaMaterialPopup from '../components/AsignarCuadrillaMaterial.Popup';
import RestockPopup from '../components/RestockPopup';
import { Search, X, Plus } from 'lucide-react';
import Swal from 'sweetalert2';
import '../styles/Herramientas.css';

export default function Materiales({ user }) {
  const [showPopup, setShowPopup] = useState(false);
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [showRestockPopup, setShowRestockPopup] = useState(false);
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
    const result = await Swal.fire({
      title: 'Eliminar material',
      text: '¿Estás seguro de que deseas eliminar este material? Esta acción no se puede deshacer.',
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
    const id = String(material.id ?? '');
    const term = searchTerm.trim().toLowerCase();
    return nombre.toLowerCase().includes(term) || id.includes(searchTerm.trim());
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
            placeholder="Buscar por nombre o ID del material..."
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
        <div className="herramientas-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={handleOpenPopup}>
            <Plus size={16} /> Agregar Material
          </button>
          <button className="btn-secondary" onClick={() => setShowRestockPopup(true)} style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
            <Plus size={16} /> Registrar Entrada Stock
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
            ? 'No se encontraron materiales con ese nombre o ID'
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

      {showRestockPopup && (
        <RestockPopup
          tipoInicial="material"
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