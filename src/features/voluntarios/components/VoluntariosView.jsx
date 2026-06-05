import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  ChevronRight,
  Edit2,
  Trash2,
  X,
  Save,
  LayoutGrid,
  List as ListIcon,
  Filter
} from 'lucide-react';
import { voluntarioService } from '../services/voluntarioService';

const VoluntariosView = () => {
  const [voluntarios, setVoluntarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('compact'); // 'compact' o 'list'
  
  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVoluntario, setSelectedVoluntario] = useState(null);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    telefono: '',
    comuna: '',
    habilidades: '',
    role_id: 2
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchVoluntarios = async () => {
    setLoading(true);
    try {
      const data = await voluntarioService.getAll();
      setVoluntarios(data.filter(u => u.role_id === 2));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoluntarios();
  }, []);

  const handleOpenEdit = (v) => {
    setSelectedVoluntario(v);
    setEditData({
      name: v.name || '',
      email: v.email || '',
      telefono: v.telefono || '',
      comuna: v.comuna || '',
      habilidades: v.habilidades || '',
      role_id: v.role_id || 2
    });
    setShowEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await voluntarioService.update(selectedVoluntario.id, editData);
      await fetchVoluntarios();
      setShowEditModal(false);
      alert('Voluntario actualizado con éxito');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar voluntario');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este voluntario?')) return;
    try {
      await voluntarioService.delete(id);
      await fetchVoluntarios();
      alert('Voluntario eliminado correctamente');
    } catch (err) {
      console.error(err);
      alert('Error al eliminar voluntario');
    }
  };

  const filteredVoluntarios = voluntarios.filter(v => 
    (v.name && v.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.email && v.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (v.comuna && v.comuna.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="voluntarios-view-container">
      <div className="vv-header-compact">
        <div className="title-section">
          <h1>Voluntarios</h1>
          <span className="count-badge">{filteredVoluntarios.length} Registrados</span>
        </div>
        
        <div className="actions-section">
          <div className="vv-search-compact">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Buscar voluntario..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="view-toggle">
            <button 
              className={viewMode === 'compact' ? 'active' : ''} 
              onClick={() => setViewMode('compact')}
              title="Vista Cuadrícula Compacta"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''} 
              onClick={() => setViewMode('list')}
              title="Vista Lista"
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-state-compact">Cargando base de datos...</div>
      ) : (
        <div className={`voluntarios-display ${viewMode}`}>
          {filteredVoluntarios.map(v => (
            <div key={v.id} className={`v-item ${viewMode}`}>
              <div className="v-avatar-mini">
                {v.name ? v.name.charAt(0).toUpperCase() : '?'}
              </div>
              
              <div className="v-info-main">
                <div className="v-name-row">
                  <h3>{v.name || 'Sin Nombre'}</h3>
                  <div className="v-actions-mini">
                    <button onClick={() => handleOpenEdit(v)}><Edit2 size={12} /></button>
                    <button className="delete" onClick={() => handleDelete(v.id)}><Trash2 size={12} /></button>
                  </div>
                </div>
                <p className="v-email-mini">{v.email}</p>
                
                <div className="v-details-mini">
                  <span title="Comuna"><MapPin size={12} /> {v.comuna || 'N/A'}</span>
                  <span title="Habilidades"><Star size={12} /> {v.habilidades ? (v.habilidades.length > 20 ? v.habilidades.substring(0, 20) + '...' : v.habilidades) : 'Sin habilidades'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Editar Voluntario</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}><X /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre</label>
                  <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="text" value={editData.telefono} onChange={e => setEditData({...editData, telefono: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Comuna</label>
                  <input type="text" value={editData.comuna} onChange={e => setEditData({...editData, comuna: e.target.value})} />
                </div>
                <div className="form-group full-width">
                  <label>Habilidades</label>
                  <textarea value={editData.habilidades} onChange={e => setEditData({...editData, habilidades: e.target.value})} rows="2" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cerrar</button>
                <button type="submit" className="btn-primary" disabled={isSaving}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .voluntarios-view-container { padding: 1.5rem; background: #f8f9fc; min-height: calc(100vh - 50px); }
        
        .vv-header-compact { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }

        .title-section { display: flex; align-items: center; gap: 1rem; }
        .title-section h1 { font-size: 1.25rem; font-weight: 700; color: #1a1a1a; margin: 0; }
        .count-badge { background: #eef4f9; color: #0066cc; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }

        .actions-section { display: flex; gap: 1rem; align-items: center; }
        .vv-search-compact { position: relative; }
        .vv-search-compact input { padding: 0.5rem 0.8rem 0.5rem 2.2rem; border-radius: 8px; border: 1px solid #ddd; font-size: 0.85rem; width: 250px; outline: none; }
        .vv-search-compact input:focus { border-color: #0066cc; }
        .vv-search-compact svg { position: absolute; left: 0.8rem; top: 50%; transform: translateY(-50%); color: #999; }

        .view-toggle { display: flex; background: #f1f3f5; padding: 0.2rem; border-radius: 8px; }
        .view-toggle button { background: none; border: none; padding: 0.4rem; cursor: pointer; border-radius: 6px; color: #666; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .view-toggle button.active { background: #fff; color: #0066cc; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        /* Displays */
        .voluntarios-display.compact { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
        .voluntarios-display.list { display: flex; flex-direction: column; gap: 0.5rem; }

        .v-item { background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 0.8rem; display: flex; gap: 0.8rem; transition: transform 0.2s; }
        .v-item:hover { border-color: #0066cc; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        
        .v-item.list { padding: 0.5rem 1rem; align-items: center; }

        .v-avatar-mini { width: 40px; height: 40px; background: #0066cc; color: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: bold; flex-shrink: 0; }
        
        .v-info-main { flex: 1; min-width: 0; }
        .v-name-row { display: flex; justify-content: space-between; align-items: flex-start; }
        .v-name-row h3 { font-size: 0.95rem; font-weight: 600; margin: 0; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        
        .v-actions-mini { display: flex; gap: 0.4rem; opacity: 0; transition: opacity 0.2s; }
        .v-item:hover .v-actions-mini { opacity: 1; }
        .v-actions-mini button { background: #f8f9fa; border: 1px solid #ddd; border-radius: 4px; padding: 0.25rem; cursor: pointer; color: #666; }
        .v-actions-mini button:hover { color: #0066cc; border-color: #0066cc; }
        .v-actions-mini button.delete:hover { color: #ff4d4d; border-color: #ff4d4d; }

        .v-email-mini { font-size: 0.75rem; color: #888; margin-bottom: 0.4rem; overflow: hidden; text-overflow: ellipsis; }
        
        .v-details-mini { display: flex; gap: 1rem; font-size: 0.75rem; color: #666; }
        .v-details-mini span { display: flex; align-items: center; gap: 0.3rem; }

        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
        .modal-content.large { background: #fff; width: 90%; max-width: 550px; border-radius: 16px; padding: 1.5rem; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { display: block; font-size: 0.75rem; font-weight: 700; color: #555; margin-bottom: 0.4rem; }
        .form-group input, .form-group textarea { width: 100%; padding: 0.6rem; border: 1px solid #ddd; border-radius: 8px; font-size: 0.85rem; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 0.8rem; margin-top: 1.5rem; }
        
        .loading-state-compact { text-align: center; padding: 3rem; color: #666; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default VoluntariosView;
