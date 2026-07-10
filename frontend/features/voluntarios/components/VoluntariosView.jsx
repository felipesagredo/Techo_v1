import React, { useState, useEffect } from 'react';
import { API_URL } from '../../../config.js';
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
import Swal from 'sweetalert2';

const showToast = (message, type = 'info') => {
  Swal.fire({
    title: type === 'success' ? '¡Éxito!' : type === 'error' ? '¡Error!' : type === 'warning' ? '¡Advertencia!' : 'Información',
    text: message,
    icon: type,
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#004785',
    customClass: {
      popup: 'premium-swal-popup',
      confirmButton: 'premium-swal-confirm-btn'
    }
  });
};

const VoluntariosView = () => {

  const [voluntarios, setVoluntarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('compact'); // 'compact' o 'list'
  const [availableTools, setAvailableTools] = useState([]);

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

  const fetchAvailableTools = async () => {
    try {
      const res = await fetch(`${API_URL}/cuadrillas/available-tools`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setAvailableTools(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignTool = async (userId, toolId) => {
    if (!userId || !toolId) return;
    try {
      const res = await fetch(`${API_URL}/cuadrillas/assign-tool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId: Number(userId), herramientaId: Number(toolId) })
      });
      if (res.ok) {
        alert('Herramienta asignada correctamente.');
        await fetchVoluntarios();
        await fetchAvailableTools();
      } else {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.error || 'Error al asignar herramienta');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al asignar herramienta');
    }
  };

  const handleReturnTool = async (toolId) => {
    if (!toolId) return;
    try {
      const res = await fetch(`${API_URL}/cuadrillas/return-tool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ herramientaId: Number(toolId) })
      });
      if (res.ok) {
        alert('Herramienta devuelta correctamente.');
        await fetchVoluntarios();
        await fetchAvailableTools();
      } else {
        const errorData = await res.json().catch(() => null);
        alert(errorData?.error || 'Error al devolver herramienta');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al devolver herramienta');
    }
  };

  useEffect(() => {
    fetchVoluntarios();
    fetchAvailableTools();
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
      showToast('Voluntario actualizado con éxito', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al actualizar voluntario', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este voluntario?')) return;
    try {
      await voluntarioService.delete(id);
      await fetchVoluntarios();
      showToast('Voluntario eliminado correctamente', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al eliminar voluntario', 'error');
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

                {/* Herramientas asignadas */}
                <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid #f1f3f5' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.4rem' }}>
                    {v.herramientas && v.herramientas.length > 0 ? (
                      v.herramientas.map((h, hIdx) => (
                        <span key={hIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.15rem 0.4rem', background: '#eef4f9', borderRadius: '4px', fontSize: '0.7rem', color: '#0066cc', fontWeight: '500' }}>
                          🔧 {h.nombre}
                          <button 
                            type="button" 
                            onClick={() => handleReturnTool(h.id)} 
                            style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: 0, marginLeft: '0.2rem', display: 'flex', alignItems: 'center' }}
                            title="Devolver Herramienta"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#868e96', fontStyle: 'italic' }}>Sin herramientas</span>
                    )}
                  </div>
                  {/* Selector para asignar */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <select 
                      defaultValue=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAssignTool(v.id, e.target.value);
                          e.target.value = "";
                        }
                      }}
                      style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', borderRadius: '6px', border: '1px solid #cbd5e0', background: '#fff', width: '100%', maxWidth: '200px' }}
                    >
                      <option value="">+ Asignar Herramienta...</option>
                      {availableTools.map(t => (
                        <option key={t.id} value={t.id}>{t.nombre} ({t.categoria_herramienta})</option>
                      ))}
                    </select>
                  </div>
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
            <form onSubmit={handleSave} className="modal-form">
              <div className="modal-body">
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
