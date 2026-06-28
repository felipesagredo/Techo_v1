import { useState, useEffect, useCallback } from 'react';
import { cuadrillaService } from '../services/cuadrillaService';

export const useCuadrillas = (user, currentView) => {
  const [cuadrillasList, setCuadrillasList] = useState([]);
  const [loadingCuadrillas, setLoadingCuadrillas] = useState(false);
  const [availableVolunteersCount, setAvailableVolunteersCount] = useState(0);

  // Unified Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({ 
    nombre: '', 
    zona: '', 
    latitud: '', 
    longitud: '',
    count: 0,
    meta_herramientas: 5,
    herramientas_requeridas: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  // Assign/Edit Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCuadrilla, setSelectedCuadrilla] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [currentMembers, setCurrentMembers] = useState([]);
  const [availableTools, setAvailableTools] = useState([]);
  const [assignData, setAssignData] = useState({ userId: '', rolCuadrillaId: '' });
  const [assigningMember, setAssigningMember] = useState(false);

  // View Members Modal state
  const [showViewMembersModal, setShowViewMembersModal] = useState(false);

  const fetchCuadrillas = useCallback(async () => {
    setLoadingCuadrillas(true);
    try {
      const [cuadrillas, available] = await Promise.all([
        cuadrillaService.getAll(),
        cuadrillaService.getAvailableCount()
      ]);
      setCuadrillasList(cuadrillas);
      setAvailableVolunteersCount(available.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCuadrillas(false);
    }
  }, []);

  useEffect(() => {
    if (user && currentView === 'cuadrillas') {
      fetchCuadrillas();
    }
  }, [user, currentView, fetchCuadrillas]);

  const handleCreateCuadrilla = async (e) => {
    e.preventDefault();

    if (createData.count && createData.count > availableVolunteersCount) {
      alert('No hay suficientes voluntarios disponibles');
      return;
    }
    
    setIsCreating(true);
    try {
      const payload = {
        ...createData,
        latitud: createData.latitud ? parseFloat(createData.latitud) : null,
        longitud: createData.longitud ? parseFloat(createData.longitud) : null,
        count: parseInt(createData.count) || 0,
        meta_herramientas: parseInt(createData.meta_herramientas) || 5
      };

      await cuadrillaService.autoGenerate(payload);
      await fetchCuadrillas();
      setShowCreateModal(false);
      setCreateData({ nombre: '', zona: '', latitud: '', longitud: '', count: 0, meta_herramientas: 5, herramientas_requeridas: '' });
      alert('¡Cuadrilla creada exitosamente!');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al crear cuadrilla');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenAssignModal = async (cuadrilla) => {
    setSelectedCuadrilla(cuadrilla);
    setShowAssignModal(true);

    try {
      const [membersData, usersData, rolesData, toolsData] = await Promise.all([
        cuadrillaService.getMembers(cuadrilla.id),
        cuadrillaService.getUsers(),
        cuadrillaService.getRoles(),
        cuadrillaService.getAvailableTools()
      ]);

      setCurrentMembers(membersData);
      setUsersList(usersData);
      setRolesList(rolesData);
      setAvailableTools(toolsData);
      if (usersData.length > 0 && rolesData.length > 0) {
        setAssignData({ userId: usersData[0].id, rolCuadrillaId: rolesData[0].id });
      }
    } catch (err) {
      console.error(err);
      alert('Error cargando datos de asignación');
    }
  };

  const handleOpenViewMembersModal = async (cuadrilla) => {
    setSelectedCuadrilla(cuadrilla);
    setShowViewMembersModal(true);

    try {
      const membersData = await cuadrillaService.getMembers(cuadrilla.id);
      setCurrentMembers(membersData);
    } catch (err) {
      console.error(err);
      alert('Error cargando miembros');
    }
  };

  const handleAssignMember = async (e) => {
    e.preventDefault();
    if (!assignData.userId || !assignData.rolCuadrillaId) return;

    setAssigningMember(true);
    try {
      await cuadrillaService.addMember({
        userId: Number(assignData.userId),
        cuadrillaId: selectedCuadrilla.id,
        rolCuadrillaId: Number(assignData.rolCuadrillaId)
      });
      const [membersData, usersData] = await Promise.all([
        cuadrillaService.getMembers(selectedCuadrilla.id),
        cuadrillaService.getUsers()
      ]);
      setCurrentMembers(membersData);
      setUsersList(usersData);
      setAssignData(prev => ({ ...prev, userId: usersData.length > 0 ? usersData[0].id : '' }));
      
      const available = await cuadrillaService.getAvailableCount();
      setAvailableVolunteersCount(available.count);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setAssigningMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedCuadrilla || !selectedCuadrilla.id) {
      alert('Error: No se ha seleccionado una cuadrilla válida.');
      return;
    }

    if (!window.confirm('¿Deseas desasignar a este miembro de la cuadrilla?')) return;
    
    try {
      await cuadrillaService.removeMember({
        userId,
        cuadrillaId: selectedCuadrilla.id
      });
      const [membersData, usersData] = await Promise.all([
        cuadrillaService.getMembers(selectedCuadrilla.id),
        cuadrillaService.getUsers()
      ]);
      setCurrentMembers(membersData);
      setUsersList(usersData);
      
      const available = await cuadrillaService.getAvailableCount();
      setAvailableVolunteersCount(available.count);
    } catch (err) {
      console.error(err);
      alert('Error al remover miembro');
    }
  };

  const handleCloseAssignModal = async () => {
    setShowAssignModal(false);
    setSelectedCuadrilla(null);
    await fetchCuadrillas();
  };

  const handleDeleteCuadrilla = async (id) => {
    console.log('Attempting to delete cuadrilla with ID:', id);
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cuadrilla? Los voluntarios quedarán libres.')) {
      console.log('Deletion cancelled by user');
      return;
    }
    
    try {
      console.log('Calling delete service...');
      await cuadrillaService.delete(id);
      console.log('Delete successful, fetching list...');
      await fetchCuadrillas();
      alert('Cuadrilla eliminada correctamente');
    } catch (err) {
      console.error('Error in handleDeleteCuadrilla:', err);
      alert('Error al eliminar cuadrilla: ' + err.message);
    }
  };  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleOpenEditModal = (cuadrilla) => {
    setEditData({ ...cuadrilla });
    setShowEditModal(true);
  };

  const handleUpdateCuadrilla = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await cuadrillaService.update(editData.id, editData);
      await fetchCuadrillas();
      setShowEditModal(false);
      alert('Cuadrilla actualizada correctamente');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar la cuadrilla');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAutoAssignTools = async () => {
    if (!selectedCuadrilla) return;
    
    try {
      const res = await cuadrillaService.autoAssignTools(selectedCuadrilla.id);
      alert(res.message || 'Asignación automática realizada con éxito');
      const membersData = await cuadrillaService.getMembers(selectedCuadrilla.id);
      setCurrentMembers(membersData);
      await fetchCuadrillas();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al asignar herramientas automáticamente');
    }
  };

  const handleAssignTool = async (userId, toolId) => {
    if (!userId || !toolId) return;
    try {
      await cuadrillaService.assignTool({ userId: Number(userId), herramientaId: Number(toolId) });
      alert('Herramienta asignada correctamente.');
      const [membersData, toolsData] = await Promise.all([
        cuadrillaService.getMembers(selectedCuadrilla.id),
        cuadrillaService.getAvailableTools()
      ]);
      setCurrentMembers(membersData);
      setAvailableTools(toolsData);
      await fetchCuadrillas();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al asignar herramienta');
    }
  };

  const handleReturnTool = async (toolId) => {
    if (!toolId) return;
    try {
      await cuadrillaService.returnTool({ herramientaId: Number(toolId) });
      alert('Herramienta devuelta correctamente.');
      const [membersData, toolsData] = await Promise.all([
        cuadrillaService.getMembers(selectedCuadrilla.id),
        cuadrillaService.getAvailableTools()
      ]);
      setCurrentMembers(membersData);
      setAvailableTools(toolsData);
      await fetchCuadrillas();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al devolver herramienta');
    }
  };

  return {
    cuadrillasList,
    loadingCuadrillas,
    availableVolunteersCount,
    showCreateModal,
    setShowCreateModal,
    createData,
    setCreateData,
    isCreating,
    showAssignModal,
    setShowAssignModal,
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
  };
};
