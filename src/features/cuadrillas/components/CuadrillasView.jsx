import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  AlertTriangle, 
  Home, 
  Eye, 
  Edit2, 
  X,
  Trash2,
  Settings,
  LayoutGrid,
  List
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
    availableTools,
    assignData,
    setAssignData,
    assigningMember,
    showViewMembersModal,
    setShowViewMembersModal,
    showEditModal,
    setShowEditModal,
    editData,
    setEditData,
    isUpdating,
    handleCreateCuadrilla,
    handleOpenAssignModal,
    handleOpenViewMembersModal,
    handleOpenEditModal,
    handleUpdateCuadrilla,
    handleAssignMember,
    handleRemoveMember,
    handleCloseAssignModal,
    handleDeleteCuadrilla,
    handleAutoAssignTools,
    handleAssignTool,
    handleReturnTool
  } = useCuadrillas(user, currentView);

  const [viewMode, setViewMode] = useState('cards');

  const parseRequerimientos = (reqString) => {
    if (!reqString) return [];
    return reqString.split(',').map(item => {
      const match = item.trim().match(/^(\d+)\s+(.+)$/);
      if (match) {
        return {
          qty: parseInt(match[1], 10),
          name: match[2].trim()
        };
      }
      return {
        qty: 1,
        name: item.trim()
      };
    }).filter(Boolean);
  };

  const countAssignedOfType = (cuadrillaTools, reqName) => {
    const cleanReq = reqName.replace(/s$/i, '').toLowerCase(); // singularized basic
    return cuadrillaTools.filter(t => t.nombre.toLowerCase().includes(cleanReq)).length;
  };

  const handleAssignToolByNeed = async (reqName) => {
    if (!selectedCuadrilla || currentMembers.length === 0) {
      alert('Debe haber miembros asignados en la cuadrilla');
      return;
    }
    
    // Find matching tool in availableTools
    const cleanReq = reqName.replace(/s$/i, '').toLowerCase();
    const matchingTool = availableTools.find(t => t.nombre.toLowerCase().includes(cleanReq));
    if (!matchingTool) {
      alert(`No hay herramientas de tipo "${reqName}" disponibles en el inventario.`);
      return;
    }

    // Find member with fewest tools
    let bestMember = currentMembers[0];
    let minTools = bestMember.herramientas ? bestMember.herramientas.length : 0;
    
    for (const m of currentMembers) {
      const toolsCount = m.herramientas ? m.herramientas.length : 0;
      if (toolsCount < minTools) {
        minTools = toolsCount;
        bestMember = m;
      }
    }

    // Assign tool to that member
    await handleAssignTool(bestMember.user_id, matchingTool.id);
  };

  return (
    <div className="cuadrillas-view-container">
      <div className="cv-header">
        <div>
          <h1>Gestión de Cuadrillas</h1>
          <p>Supervisa y organiza los equipos de construcción en terreno. Cada nueva cuadrilla se asigna automáticamente con voluntarios disponibles.</p>
        </div>
        <div className="cv-header-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="view-toggle" style={{ display: 'flex', background: '#f1f3f5', padding: '0.2rem', borderRadius: '8px' }}>
            <button 
              className={`toggle-btn ${viewMode === 'cards' ? 'active' : ''}`} 
              onClick={() => setViewMode('cards')}
              title="Vista de Tarjetas"
              style={{ background: viewMode === 'cards' ? 'white' : 'none', border: 'none', padding: '0.4rem', borderRadius: '6px', display: 'flex', cursor: 'pointer', color: viewMode === 'cards' ? 'var(--primary-blue)' : '#666' }}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`} 
              onClick={() => setViewMode('table')}
              title="Vista de Tabla"
              style={{ background: viewMode === 'table' ? 'white' : 'none', border: 'none', padding: '0.4rem', borderRadius: '6px', display: 'flex', cursor: 'pointer', color: viewMode === 'table' ? 'var(--primary-blue)' : '#666' }}
            >
              <List size={16} />
            </button>
          </div>
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
        <div className="cv-kpi-card cv-kpi-green">
          <p>HERRAMIENTAS LIBRES</p>
          <h2>{availableTools.length < 10 ? `0${availableTools.length}` : availableTools.length}</h2>
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

      {loadingCuadrillas ? (
        <p className="loading-text">Cargando...</p>
      ) : viewMode === 'table' ? (
        <div className="cv-table-container">
          <div className="cv-table-header">
            <div className="col-equipo">EQUIPO / UBICACIÓN</div>
            <div className="col-capataz">CAPATAZ ASIGNADO</div>
            <div className="col-herramientas">HERRAMIENTAS</div>
            <div className="col-miembros">MIEMBROS</div>
            <div className="col-estado">ESTADO</div>
            <div className="col-acciones">ACCIONES</div>
          </div>

          <div className="cv-table-body">
            {cuadrillasList.map(cuadrilla => {
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
                  <div className="col-herramientas">
                    {cuadrilla.herramientas && cuadrilla.herramientas.length > 0 ? (
                      <div className="tools-badge-list" title={cuadrilla.herramientas.map(t => `${t.nombre} (${t.voluntario})`).join(', ')}>
                        <span className="tools-count-badge">🔧 {cuadrilla.herramientas.length} / {cuadrilla.meta_herramientas || 5}</span>
                        <div className="tools-preview-names">
                          {cuadrilla.herramientas.slice(0, 2).map((t, idx) => (
                            <span key={idx} className="tool-mini-badge">{t.nombre}</span>
                          ))}
                          {cuadrilla.herramientas.length > 2 && (
                            <span className="tool-mini-badge-more">+{cuadrilla.herramientas.length - 2}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="no-tools-text">🔧 0 / {cuadrilla.meta_herramientas || 5}</span>
                    )}
                     {cuadrilla.herramientas_requeridas && (
                      <div className="table-required-tools-hint" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', marginTop: '0.25rem' }}>
                        {parseRequerimientos(cuadrilla.herramientas_requeridas).map((req, rIdx) => {
                          const assigned = countAssignedOfType(cuadrilla.herramientas || [], req.name);
                          const isComplete = assigned >= req.qty;
                          return (
                            <span key={rIdx} style={{ fontSize: '0.6rem', color: isComplete ? '#27ae60' : '#e67e22', background: isComplete ? '#eafaf1' : '#fffbeb', padding: '0.05rem 0.2rem', borderRadius: '3px', border: `1px solid ${isComplete ? '#2ecc71' : '#fde68a'}`, textTransform: 'capitalize' }}>
                              {req.name}: {assigned}/{req.qty}
                            </span>
                          );
                        })}
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
                      <span className={`cv-badge badge-${(cuadrilla.estado || 'PENDIENTE').toLowerCase().replace(/\s/g, '-')}`}>{cuadrilla.estado || 'PENDIENTE'}</span>
                    )}
                  </div>
                  <div className="col-acciones">
                    <div className="normal-actions">
                      <button className="icon-action" title="Ver Miembros" onClick={() => handleOpenViewMembersModal(cuadrilla)}><Eye size={16} /></button>
                      <button className="icon-action" title="Gestionar Equipo" onClick={() => handleOpenAssignModal(cuadrilla)}><Edit2 size={16} /></button>
                      <button className="icon-action" title="Configuración" onClick={() => handleOpenEditModal(cuadrilla)}><Settings size={16} /></button>
                      <button 
                        className="icon-action text-red" 
                        title="Eliminar Cuadrilla" 
                        onClick={() => {
                          console.log('Delete button clicked for ID:', cuadrilla.id);
                          handleDeleteCuadrilla(cuadrilla.id);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="cuadrillas-cards-grid">
          {cuadrillasList.map(cuadrilla => {
            const noCapataz = !cuadrilla.capataz_nombre;
            const volPct = Math.min(100, ((cuadrilla.miembros_count || 0) / (cuadrilla.meta_voluntarios || 5)) * 100);
            const toolsCount = cuadrilla.herramientas ? cuadrilla.herramientas.length : 0;
            const toolsPct = Math.min(100, (toolsCount / (cuadrilla.meta_herramientas || 5)) * 100);

            return (
              <div 
                key={cuadrilla.id} 
                className={`cuadrilla-card ${noCapataz ? 'card-no-leader' : ''} status-${(cuadrilla.estado || 'PENDIENTE').toLowerCase().replace(/\s/g, '-')}`}
              >
                {/* Cabecera Tarjeta */}
                <div className="card-header">
                  <div className="card-title-group">
                    <span className={`card-icon ${noCapataz ? 'icon-alert' : 'icon-normal'}`}><Home size={16} /></span>
                    <div>
                      <h3>{cuadrilla.nombre}</h3>
                      <p className="card-zona">{cuadrilla.zona}</p>
                    </div>
                  </div>
                  <span className={`cv-badge badge-${(cuadrilla.estado || 'PENDIENTE').toLowerCase().replace(/\s/g, '-')}`}>
                    {cuadrilla.estado || 'PENDIENTE'}
                  </span>
                </div>

                {/* Lista de Voluntarios (Miembros) y sus Herramientas */}
                <div className="card-body">
                  <h4 className="section-title">Voluntarios Asignados ({cuadrilla.miembros_count})</h4>
                  <div className="card-members-list">
                    {!cuadrilla.miembros || cuadrilla.miembros.length === 0 ? (
                      <p className="no-members-text">Sin voluntarios asignados</p>
                    ) : (
                      cuadrilla.miembros.map((m, mIdx) => {
                        const isLeader = m.cargo === 'Capataz de Zona' || m.cargo === 'Voluntario Senior';
                        return (
                          <div key={m.user_id || mIdx} className="card-member-row">
                            <div className="member-avatar-mini" title={m.cargo}>
                              {m.name ? m.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="member-details">
                              <div className="member-meta-line">
                                <span className="member-name">{m.name}</span>
                                <span className={`member-role-badge ${isLeader ? 'role-leader' : 'role-normal'}`}>
                                  {m.cargo}
                                </span>
                              </div>
                              
                              {/* Herramientas del voluntario */}
                              <div className="member-tools-mini-list">
                                {m.herramientas && m.herramientas.length > 0 ? (
                                  m.herramientas.map((h, hIdx) => (
                                    <span key={hIdx} className="member-tool-tag" title={`Estado: ${h.estado}`}>
                                      🔧 {h.nombre}
                                    </span>
                                  ))
                                ) : (
                                  <span className="no-tools-tag">Sin herramientas</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {/* Barras de Cumplimiento */}
                  <div className="card-metrics">
                    <div className="metric-row">
                      <div className="metric-info">
                        <span>Voluntarios</span>
                        <strong>{cuadrilla.miembros_count} / {cuadrilla.meta_voluntarios || 5}</strong>
                      </div>
                      <div className="metric-bar">
                        <div className="metric-fill vol-fill" style={{ width: `${volPct}%` }}></div>
                      </div>
                    </div>

                    <div className="metric-row">
                      <div className="metric-info">
                        <span>Herramientas</span>
                        <strong>{toolsCount} / {cuadrilla.meta_herramientas || 5}</strong>
                      </div>
                      <div className="metric-bar">
                        <div className="metric-fill tools-fill" style={{ width: `${toolsPct}%` }}></div>
                      </div>
                    </div>

                     {cuadrilla.herramientas_requeridas && (
                      <div className="card-required-tools-progress" style={{ marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px dashed #e9ecef' }}>
                        <span style={{ fontWeight: 700, color: '#495057', fontSize: '0.7rem', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          🎯 Requerimiento de Herramientas:
                        </span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                          {parseRequerimientos(cuadrilla.herramientas_requeridas).map((req, rIdx) => {
                            const assigned = countAssignedOfType(cuadrilla.herramientas || [], req.name);
                            const isComplete = assigned >= req.qty;
                            return (
                              <div key={rIdx} style={{ background: isComplete ? '#eafaf1' : '#fef9e7', border: `1px solid ${isComplete ? '#2ecc71' : '#f39c12'}`, padding: '0.25rem 0.4rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem' }}>
                                <span style={{ fontWeight: 600, color: isComplete ? '#27ae60' : '#d35400', textTransform: 'capitalize' }}>
                                  🛠️ {req.name}
                                </span>
                                <span style={{ fontWeight: 700, color: isComplete ? '#27ae60' : '#d35400' }}>
                                  {assigned} / {req.qty}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* Acciones del Pie */}
                <div className="card-actions">
                  <div className="action-buttons-group">
                    <button className="icon-action" title="Ver Detalle" onClick={() => handleOpenViewMembersModal(cuadrilla)}><Eye size={16} /></button>
                    <button className="icon-action" title="Gestionar Equipo" onClick={() => handleOpenAssignModal(cuadrilla)}><Edit2 size={16} /></button>
                    <button className="icon-action" title="Configurar" onClick={() => handleOpenEditModal(cuadrilla)}><Settings size={16} /></button>
                    <button 
                      className="icon-action text-red" 
                      title="Eliminar" 
                      onClick={() => handleDeleteCuadrilla(cuadrilla.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
            
            <form onSubmit={handleCreateCuadrilla} className="modal-form">
              <div className="modal-body">
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

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Voluntarios a Asignar (Libres: {availableVolunteersCount})</label>
                    <input
                      type="number"
                      min="0"
                      max={availableVolunteersCount}
                      value={createData.count || 0}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setCreateData({ ...createData, count: isNaN(val) ? 0 : val });
                      }}
                      className="modal-input"
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label>Meta de Herramientas</label>
                    <input
                      type="number"
                      min="1"
                      value={createData.meta_herramientas || 5}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setCreateData({ ...createData, meta_herramientas: isNaN(val) ? 5 : val });
                      }}
                      required
                      className="modal-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Herramientas Requeridas Específicamente</label>
                  <input
                    type="text"
                    placeholder="Ej. 2 Martillos, 1 Sierra, 1 Pala"
                    value={createData.herramientas_requeridas || ''}
                    onChange={e => setCreateData({ ...createData, herramientas_requeridas: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isCreating}>
                  {isCreating ? 'Creando...' : 'Crear Cuadrilla'}
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

            <div className="modal-body">
              {(() => {
                const leaders = currentMembers.filter(m => m.cargo === 'Capataz de Zona' || m.cargo === 'Voluntario Senior');
                return leaders.length === 0 ? (
                  <div className="leadership-alert alert-warning">
                    <AlertTriangle size={16} /> Falta asignar un líder a esta cuadrilla (Capataz de Zona o Voluntario Senior).
                  </div>
                ) : (
                  <div className="leadership-alert alert-success">
                    <span>✓</span> Líder asignado: {leaders.map(l => `${l.name} (${l.cargo})`).join(', ')}
                  </div>
                );
              })()}

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

                  {selectedCuadrilla.herramientas_requeridas && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f3f5' }}>
                      <h3 style={{ marginBottom: '0.5rem' }}>Necesidades de la Cuadrilla</h3>
                      <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                        Asigna herramientas del inventario basadas en los requerimientos del equipo.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1rem' }}>
                        {parseRequerimientos(selectedCuadrilla.herramientas_requeridas).map((req, rIdx) => {
                          const assigned = countAssignedOfType(selectedCuadrilla.herramientas || [], req.name);
                          const isComplete = assigned >= req.qty;
                          const matchingAvailable = availableTools.filter(t => t.nombre.toLowerCase().includes(req.name.replace(/s$/i, '').toLowerCase()));
                          
                          return (
                            <div key={rIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isComplete ? '#f0fdf4' : '#fffbeb', padding: '0.4rem 0.6rem', borderRadius: '6px', border: `1px solid ${isComplete ? '#bbf7d0' : '#fde68a'}`, fontSize: '0.75rem' }}>
                              <div>
                                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>🛠️ {req.name}</span>
                                <span style={{ marginLeft: '0.4rem', color: isComplete ? '#15803d' : '#b45309', fontWeight: 700 }}>
                                  {assigned} / {req.qty}
                                </span>
                                <span style={{ display: 'block', fontSize: '0.6rem', color: '#64748b', marginTop: '0.05rem' }}>
                                  ({matchingAvailable.length} disponibles)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAssignToolByNeed(req.name)}
                                disabled={isComplete || matchingAvailable.length === 0 || currentMembers.length === 0}
                                className="btn-primary"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.65rem', height: 'auto', background: isComplete ? '#15803d' : 'var(--primary-blue)' }}
                              >
                                + Asignar
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f3f5' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>Asignación de Herramientas Automática</h3>
                    <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '1rem', lineHeight: '1.4' }}>
                      Asigna herramientas disponibles de forma equitativa a los miembros actuales del equipo para cumplir con la meta establecida (Meta: {selectedCuadrilla.meta_herramientas || 5} herramientas).
                    </p>
                    <button 
                      type="button" 
                      className="btn-outline"
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      onClick={handleAutoAssignTools}
                      disabled={currentMembers.length === 0}
                    >
                      🔧 Asignar Automáticamente
                    </button>
                  </div>
                </div>

                <div className="members-list-section">
                  <h3>Miembros Actuales ({currentMembers.length})</h3>
                  <div className="members-list">
                    {currentMembers.length === 0 ? <p className="text-muted text-center py-1">No hay miembros asignados.</p> : null}
                      {currentMembers.map((m) => (
                        <div key={m.user_id} className="member-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem', padding: '1rem', borderBottom: '1px solid #f1f3f5' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                              <div className="member-avatar">{m.name ? m.name.charAt(0).toUpperCase() : '?'}</div>
                              <div className="member-info">
                                <h4 style={{ margin: 0 }}>{m.name}</h4>
                                <span className={`member-role ${m.cargo && (m.cargo.includes('Capataz') || m.cargo.includes('Senior')) ? 'role-capataz' : 'role-normal'}`}>{m.cargo}</span>
                              </div>
                            </div>
                            <button 
                              className="btn-liberar" 
                              type="button"
                              title="Quitar de la cuadrilla" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveMember(m.user_id);
                              }}
                            >
                              <Trash2 size={12} />
                              <span>Liberar</span>
                            </button>
                          </div>

                          {/* Herramientas del voluntario */}
                          <div style={{ paddingLeft: '2.8rem', marginTop: '0.3rem' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
                              {m.herramientas && m.herramientas.length > 0 ? (
                                m.herramientas.map((h, hIdx) => (
                                  <span key={hIdx} className="member-tool-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', padding: '0.2rem 0.5rem', background: '#eef4f9', borderRadius: '4px', fontSize: '0.7rem', color: '#0066cc', fontWeight: '500' }}>
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
                                <span style={{ fontSize: '0.7rem', color: '#868e96', fontStyle: 'italic' }}>Sin herramientas asignadas</span>
                              )}
                            </div>

                            {/* Dropdown de asignación */}
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <select 
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleAssignTool(m.user_id, e.target.value);
                                    e.target.value = ""; // reset dropdown
                                  }
                                }}
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e0', background: '#fff', flex: 1 }}
                              >
                                <option value="">+ Asignar Herramienta...</option>
                                {availableTools.map(t => (
                                  <option key={t.id} value={t.id}>{t.nombre} ({t.categoria_herramienta})</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
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

            <div className="modal-body">
              <div className="members-list-section mt-1">
                <div className="members-list">
                  {currentMembers.length === 0 ? <p className="text-muted">No hay miembros asignados a esta cuadrilla.</p> : null}
                  {currentMembers.map((m, idx) => (
                    <div key={idx} className="member-item">
                      <div className="member-avatar">{m.name.charAt(0).toUpperCase()}</div>
                      <div className="member-info">
                        <h4>{m.name}</h4>
                        <span className={`member-role ${m.cargo.includes('Capataz') || m.cargo.includes('Senior') ? 'role-capataz' : 'role-normal'}`}>{m.cargo}</span>
                      </div>
                      <div className="member-tools">
                        {m.herramientas && m.herramientas.length > 0 ? (
                          m.herramientas.map((h, hIdx) => (
                            <span key={hIdx} className="tool-mini-badge" title={`Estado: ${h.estado}`}>
                              🔧 {h.nombre}
                            </span>
                          ))
                        ) : (
                          <span className="no-tools-text-small">Sin herramientas</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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

      {/* Modal Editar Cuadrilla (Configuración) */}
      {showEditModal && editData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Configurar Cuadrilla</h2>
              <button className="icon-btn" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateCuadrilla} className="modal-form">
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre de la Cuadrilla</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editData.nombre || ''}
                    onChange={e => setEditData({ ...editData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Zona / Ubicación</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={editData.zona || ''}
                    onChange={e => setEditData({ ...editData, zona: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Herramientas Requeridas Específicamente</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="Ej. 2 Martillos, 1 Sierra, 1 Pala"
                    value={editData.herramientas_requeridas || ''}
                    onChange={e => setEditData({ ...editData, herramientas_requeridas: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group flex-1">
                    <label>Objetivo Voluntarios</label>
                    <input
                      type="number"
                      className="modal-input"
                      value={editData.meta_voluntarios || ''}
                      onChange={e => setEditData({ ...editData, meta_voluntarios: Number(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label>Objetivo Herramientas</label>
                    <input
                      type="number"
                      className="modal-input"
                      value={editData.meta_herramientas || 5}
                      onChange={e => setEditData({ ...editData, meta_herramientas: Number(e.target.value) })}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group flex-1">
                    <label>Estado</label>
                    <select
                      className="modal-input"
                      value={editData.estado || 'PENDIENTE'}
                      onChange={e => setEditData({ ...editData, estado: e.target.value })}
                    >
                      <option value="PENDIENTE">PENDIENTE</option>
                      <option value="EN CONSTRUCCION">EN CONSTRUCCION</option>
                      <option value="COMPLETA">COMPLETA</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={isUpdating}>
                  {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuadrillasView;
