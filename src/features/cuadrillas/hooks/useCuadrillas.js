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
    count: 5 
  });
  const [isCreating, setIsCreating] = useState(false);

  // Assign/Edit Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCuadrilla, setSelectedCuadrilla] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [currentMembers, setCurrentMembers] = useState([]);
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
      alert('Por favor, selecciona una ubicación en el mapa haciendo clic sobre él.');
      return;
    }

    if (createData.count > availableVolunteersCount) {
      alert('No hay suficientes voluntarios disponibles');
      return;
    }
    
    setIsCreating(true);
    try {
      // Aseguramos que lat/long viajen como números
      const payload = {
        ...createData,
        latitud: parseFloat(createData.latitud),
        longitud: parseFloat(createData.longitud)
      };

      await cuadrillaService.autoGenerate(payload);
      await fetchCuadrillas();
      setShowCreateModal(false);
      setCreateData({ nombre: '', zona: '', latitud: '', longitud: '', count: 5 });
      alert('¡Cuadrilla creada y asignada exitosamente!');
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
      const [membersData, usersData, rolesData] = await Promise.all([
        cuadrillaService.getMembers(cuadrilla.id),
        cuadrillaService.getUsers(),
        cuadrillaService.getRoles()
      ]);

      setCurrentMembers(membersData);
      setUsersList(usersData);
      setRolesList(rolesData);
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
      const membersData = await cuadrillaService.getMembers(selectedCuadrilla.id);
      setCurrentMembers(membersData);
      
      const available = await cuadrillaService.getAvailableCount();
      setAvailableVolunteersCount(available.count);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setAssigningMember(false);
    }
  };

  const handleCloseAssignModal = async () => {
    setShowAssignModal(false);
    setSelectedCuadrilla(null);
    await fetchCuadrillas();
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
  };
};
