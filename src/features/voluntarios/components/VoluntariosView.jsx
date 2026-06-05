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
import '../../../styles/VoluntariosView.css';

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
                  <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="text" value={editData.telefono} onChange={e => setEditData({ ...editData, telefono: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Comuna</label>
                  <input type="text" value={editData.comuna} onChange={e => setEditData({ ...editData, comuna: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Rol de Sistema</label>
                  <select 
                    value={editData.role_id} 
                    onChange={e => setEditData({ ...editData, role_id: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '0.6rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.85rem', background: '#fff' }}
                  >
                    <option value={1}>Administrador</option>
                    <option value={2}>Voluntario</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Habilidades</label>
                  <textarea value={editData.habilidades} onChange={e => setEditData({ ...editData, habilidades: e.target.value })} rows="2" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cerrar</button>
                <button type="submit" className="btn-primary" disabled={isSaving}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}    </div>
  );
};

export default VoluntariosView;
