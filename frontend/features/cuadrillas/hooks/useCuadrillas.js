import { useState, useEffect, useCallback } from 'react';
import { cuadrillaService } from '../services/cuadrillaService';
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
    count: 7,
    meta_herramientas: 14,
    herramientas_requeridas: '1 Sierra, 6 Martillo, 6 Huincha, 1 Caja de Clavos'
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
    // Validación de seguridad
    if (!createData.latitud || !createData.longitud) {
      showToast('Por favor, selecciona una ubicación en el mapa haciendo clic sobre él.', 'warning');
      return;
    }

    /*
    if (availableVolunteersCount < 7) {
      showToast('No hay suficientes voluntarios disponibles libres. Se requieren mínimo 7 (1 jefe y 6 voluntarios).', 'error');
      return;
    }
    */

    setIsCreating(true);
    try {
      const payload = {
        nombre: createData.nombre,
        zona: createData.zona,
        latitud: createData.latitud ? parseFloat(createData.latitud) : null,
        longitud: createData.longitud ? parseFloat(createData.longitud) : null,
        count: 7,
        meta_herramientas: 14,
        herramientas_requeridas: '1 Sierra, 6 Martillo, 6 Huincha, 1 Caja de Clavos'
      };

      await cuadrillaService.autoGenerate(payload);
      await fetchCuadrillas();
      setShowCreateModal(false);
      setCreateData({ nombre: '', zona: '', latitud: '', longitud: '', count: 7, meta_herramientas: 14, herramientas_requeridas: '1 Sierra, 6 Martillo, 6 Huincha, 1 Caja de Clavos' });
      showToast('¡Cuadrilla creada exitosamente!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error al crear cuadrilla', 'error');
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
      showToast('Error cargando datos de asignación', 'error');
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
      showToast('Error cargando miembros', 'error');
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
      showToast(err.message, 'error');
    } finally {
      setAssigningMember(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!selectedCuadrilla || !selectedCuadrilla.id) {
      showToast('Error: No se ha seleccionado una cuadrilla válida.', 'error');
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
      showToast('Error al remover miembro', 'error');
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
      showToast('Cuadrilla eliminada correctamente', 'success');
    } catch (err) {
      console.error('Error in handleDeleteCuadrilla:', err);
      showToast('Error al eliminar cuadrilla: ' + err.message, 'error');
    }
  }; const [showEditModal, setShowEditModal] = useState(false);
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
      showToast('Cuadrilla actualizada correctamente', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al actualizar la cuadrilla', 'error');
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
    setSelectedCuadrilla,
    setCuadrillasList,
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
