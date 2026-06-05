import cuadrillaService from '../services/cuadrillaService.js';

export const getAll = async (req, res) => {
    try {
        const cuadrillas = await cuadrillaService.getAllCuadrillas();
        res.json(cuadrillas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener cuadrillas' });
    }
};

export const getRoles = async (req, res) => {
    try {
        const roles = await cuadrillaService.getRolesCuadrilla();
        res.json(roles);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener roles de cuadrilla' });
    }
};

export const create = async (req, res) => {
    try {
        const { nombre, zona, latitud, longitud } = req.body;
        const cuadrilla = await cuadrillaService.createCuadrilla(nombre, zona, latitud, longitud);
        res.status(201).json(cuadrilla);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear cuadrilla' });
    }
};

export const addMember = async (req, res) => {
    try {
        const { userId, cuadrillaId, rolCuadrillaId } = req.body;
        const asignacion = await cuadrillaService.assignMember(userId, cuadrillaId, rolCuadrillaId);
        res.status(201).json(asignacion);
    } catch (err) {
        res.status(500).json({ error: 'Error al asignar miembro' });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { userId, cuadrillaId } = req.body;
        await cuadrillaService.unassignMember(userId, cuadrillaId);
        res.json({ message: 'Miembro desasignado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al desasignar miembro' });
    }
};

export const getDetails = async (req, res) => {
    try {
        const miembros = await cuadrillaService.getMiembrosByCuadrilla(req.params.id);
        res.json(miembros);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener detalles' });
    }
};

export const getAvailableCount = async (req, res) => {
    try {
        const count = await cuadrillaService.getAvailableVolunteersCount();
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener voluntarios disponibles' });
    }
};

export const autoGenerate = async (req, res) => {
    try {
        const { nombre, zona, count, latitud, longitud } = req.body;
        const result = await cuadrillaService.autoGenerateCuadrilla(nombre, zona, count, latitud, longitud);
        res.status(201).json(result);
    } catch (err) {
        console.error('Error en autoGenerate:', err);
        res.status(500).json({ error: err.message || 'Error interno al generar cuadrilla' });
    }
};

export const remove = async (req, res) => {
    try {
        const result = await cuadrillaService.deleteCuadrilla(req.params.id);
        if (!result) return res.status(404).json({ error: 'Cuadrilla no encontrada' });
        res.json({ message: 'Cuadrilla eliminada correctamente', cuadrilla: result });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar cuadrilla' });
    }
};

export const update = async (req, res) => {
    try {
        const result = await cuadrillaService.updateCuadrilla(req.params.id, req.body);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al actualizar cuadrilla' });
    }
};

const cuadrillaController = {
    getAll,
    getRoles,
    create,
    addMember,
    removeMember,
    getDetails,
    getAvailableCount,
    autoGenerate,
    remove,
    update
};

export default cuadrillaController;
