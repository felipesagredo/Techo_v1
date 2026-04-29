import React from 'react';
import { 
  Users, 
  Plus, 
  AlertTriangle, 
  Home, 
  Eye, 
  Edit2, 
  X 
} from 'lucide-react';
import { useCuadrillas } from '../hooks/useCuadrillas';
import LocationPicker from './LocationPicker';

const CuadrillasView = ({ user, currentView }) => {
  const {
    cuadrillasList,
    loadingCuadrillas,
    availableVolunteersCount,
    showCreateModal,
    setShowCreateModal,
    createData,
    setCreateData,
    isCreating,
    showAssignModal,
    selectedCuadrilla,
    usersList,
    rolesList,
    currentMembers,
    assignData,
    setAssignData,
    assigningMember,
    showViewMembersModal,
    setShowViewMembersModal,
    handleCreateCuadrilla,
    handleOpenAssignModal,
    handleOpenViewMembersModal,
    handleAssignMember,
    handleCloseAssignModal
  } = useCuadrillas(user, currentView);

  return (
    <div className="cuadrillas-view-container">
      <div className="cv-header">
        <div>
          <h1>Gestión de Cuadrillas</h1>
          <p>Supervisa y organiza los equipos de construcción en terreno. Cada nueva cuadrilla se asigna automáticamente con voluntarios disponibles.</p>
        </div>
        <div className="cv-header-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Nueva Cuadrilla
          </button>
        </div>
      </div>

      <div className="cv-kpis">
        <div className="cv-kpi-card">
          <p>TOTAL EQUIPOS</p>
          <h2>{cuadrillasList.length}</h2>
        </div>
        <div className="cv-kpi-card cv-kpi-blue">
          <p>VOLUNTARIOS DISPONIBLES</p>
          <h2>{availableVolunteersCount < 10 ? `0${availableVolunteersCount}` : availableVolunteersCount}</h2>
        </div>
        <div className="cv-kpi-card cv-kpi-red">
          <p>SIN CAPATACES</p>
          <h2>
            {cuadrillasList.filter(c => !c.capataz_nombre).length < 10 
              ? `0${cuadrillasList.filter(c => !c.capataz_nombre).length}` 
              : cuadrillasList.filter(c => !c.capataz_nombre).length} 
            <AlertTriangle size={18} />
          </h2>
        </div>
        <div className="cv-kpi-card cv-kpi-wide">
          <div className="cv-kpi-text">
            <p>META SEMANAL</p>
            <h3>12 Viviendas en proceso</h3>
          </div>
          <div className="cv-progress-bar">
            <div className="cv-progress-fill"></div>
          </div>
        </div>
      </div>

      <div className="cv-table-container">
        <div className="cv-table-header">
          <div className="col-equipo">EQUIPO / UBICACIÓN</div>
          <div className="col-capataz">CAPATAZ ASIGNADO</div>
          <div className="col-miembros">MIEMBROS</div>
          <div className="col-estado">ESTADO</div>
          <div className="col-acciones">ACCIONES</div>
        </div>

        <div className="cv-table-body">
          {loadingCuadrillas ? <p className="loading-text">Cargando...</p> : cuadrillasList.map(cuadrilla => {
            const noCapataz = !cuadrilla.capataz_nombre;
            return (
              <div key={cuadrilla.id} className={`cv-table-row ${noCapataz ? 'row-alert' : ''}`}>
                <div className="col-equipo">
                  <div className={`cv-icon ${noCapataz ? 'icon-alert' : 'icon-normal'}`}>
                    <Home size={18} />
                  </div>
                  <div>
                    <h4>{cuadrilla.nombre}</h4>
                    <p>{cuadrilla.zona}</p>
                  </div>
                </div>
                <div className="col-capataz">
                  {noCapataz ? (
                    <div className="no-capataz-text"><Users size={14} /> ASIGNAR CAPATAZ</div>
                  ) : (
                    <div className="capataz-info">
                      <div className="capataz-avatar">{cuadrilla.capataz_nombre.charAt(0)}</div>
                      <div>
                        <h4>{cuadrilla.capataz_nombre}</h4>
                        <p>{cuadrilla.capataz_rol}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-miembros">
                  <span className={`miembros-number ${noCapataz ? 'text-red' : 'text-blue'}`}>
                    {cuadrilla.miembros_count < 10 ? `0${cuadrilla.miembros_count}` : cuadrilla.miembros_count}
                    <small className="miembros-meta"> / {cuadrilla.meta_voluntarios || 5}</small>
                  </span>
                </div>
                <div className="col-estado">
                  {cuadrilla.miembros_count < cuadrilla.meta_voluntarios ? (
                    <span className="cv-badge badge-incompleta">INCOMPLETA</span>
                  ) : (
                    <span className={`cv-badge badge-${cuadrilla.estado.toLowerCase().replace(/\s/g, '-')}`}>{cuadrilla.estado}</span>
                  )}
                </div>
                <div className="col-acciones">
                  <div className="normal-actions">
                    <button className="icon-action" title="Ver Miembros" onClick={() => handleOpenViewMembersModal(cuadrilla)}><Eye size={16} /></button>
                    <button className="icon-action" title="Gestionar Equipo" onClick={() => handleOpenAssignModal(cuadrilla)}><Edit2 size={16} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Unificado: Nueva Cuadrilla con Auto-Asignación */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Configurar Nueva Cuadrilla</h2>
              <button className="icon-btn" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <p className="modal-subtitle">Define el nombre, ubicación y la cantidad de voluntarios para asignación automática.</p>
            
            <form onSubmit={handleCreateCuadrilla}>
              <div className="form-group">
                <label>Nombre de la Cuadrilla</label>
                <input
                  type="text"
                  placeholder="Ej. Cuadrilla Los Pinos - Fase 1"
                  value={createData.nombre}
                  onChange={e => setCreateData({ ...createData, nombre: e.target.value })}
                  required
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label>Zona / Proyecto</label>
                <input
                  type="text"
                  placeholder="Ej. Campamento Esperanza, Maipú"
                  value={createData.zona}
                  onChange={e => setCreateData({ ...createData, zona: e.target.value })}
                  required
                  className="modal-input"
                />
              </div>

              <div className="form-group">
                <label>Ubicación en el Mapa</label>
                <LocationPicker 
                  lat={createData.latitud} 
                  lng={createData.longitud} 
                  onChange={(lat, lng) => setCreateData({ ...createData, latitud: lat, longitud: lng })} 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitud</label>
                  <input type="text" value={createData.latitud} readOnly placeholder="..." className="modal-input readonly-input" />
                </div>
                <div className="form-group">
                  <label>Longitud</label>
                  <input type="text" value={createData.longitud} readOnly placeholder="..." className="modal-input readonly-input" />
                </div>
              </div>

              <div className="form-group">
                <label>Cantidad de Voluntarios a Asignar (Libres: {availableVolunteersCount})</label>
                <input
                  type="number"
                  min="1"
                  max={availableVolunteersCount}
                  value={createData.count}
                  onChange={e => setCreateData({ ...createData, count: parseInt(e.target.value) })}
                  required
                  className="modal-input"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isCreating || availableVolunteersCount === 0}>
                  {isCreating ? 'Creando...' : 'Crear y Asignar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gestionar Equipo (Edición) */}
      {showAssignModal && selectedCuadrilla && (
        <div className="modal-overlay">
          <div className="modal-content assign-modal-content">
            <div className="modal-header">
              <h2>Administrar Equipo: {selectedCuadrilla.nombre}</h2>
              <button className="icon-btn" onClick={handleCloseAssignModal}>
                <X size={20} />
              </button>
            </div>

            <div className="assign-layout">
              <div className="assign-form-section">
                <h3>Añadir Miembro Manualmente</h3>
                <form onSubmit={handleAssignMember} className="form-row-inline">
                  <div className="form-group flex-2">
                    <label>Voluntario</label>
                    <select
                      className="modal-input"
                      value={assignData.userId}
                      onChange={e => setAssignData({ ...assignData, userId: e.target.value })}
                    >
                      <option value="">Seleccionar voluntario...</option>
                      {usersList.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group flex-1">
                    <label>Rol</label>
                    <select
                      className="modal-input"
                      value={assignData.rolCuadrillaId}
                      onChange={e => setAssignData({ ...assignData, rolCuadrillaId: e.target.value })}
                    >
                      {rolesList.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                    </select>
                  </div>
                  <div className="form-group submit-group">
                    <button type="submit" className="btn-primary btn-add-member" disabled={assigningMember}>
                      {assigningMember ? '...' : <Plus size={16} />}
                    </button>
                  </div>
                </form>
              </div>

              <div className="members-list-section">
                <h3>Miembros Actuales ({currentMembers.length})</h3>
                <div className="members-list">
                  {currentMembers.length === 0 ? <p className="text-muted text-center py-1">No hay miembros asignados.</p> : null}
                  {currentMembers.map((m, idx) => (
                    <div key={idx} className="member-item">
                      <div className="member-avatar">{m.name.charAt(0).toUpperCase()}</div>
                      <div className="member-info">
                        <h4>{m.name}</h4>
                        <span className={`member-role ${m.cargo.includes('Capataz') ? 'role-capataz' : 'role-normal'}`}>{m.cargo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-primary" onClick={handleCloseAssignModal}>
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Integrantes */}
      {showViewMembersModal && selectedCuadrilla && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Integrantes: {selectedCuadrilla.nombre}</h2>
              <button className="icon-btn" onClick={() => setShowViewMembersModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="members-list-section mt-1">
              <div className="members-list">
                {currentMembers.length === 0 ? <p className="text-muted">No hay miembros asignados a esta cuadrilla.</p> : null}
                {currentMembers.map((m, idx) => (
                  <div key={idx} className="member-item">
                    <div className="member-avatar">{m.name.charAt(0).toUpperCase()}</div>
                    <div className="member-info">
                      <h4>{m.name}</h4>
                      <span className={`member-role ${m.cargo.includes('Capataz') ? 'role-capataz' : 'role-normal'}`}>{m.cargo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-primary" onClick={() => setShowViewMembersModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuadrillasView;
