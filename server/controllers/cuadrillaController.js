const cuadrillaService = require('../services/cuadrillaService');

exports.getAll = async (req, res) => {
    try {
        const cuadrillas = await cuadrillaService.getAllCuadrillas();
        res.json(cuadrillas);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener cuadrillas' });
    }
};

exports.getRoles = async (req, res) => {
    try {
        const roles = await cuadrillaService.getRolesCuadrilla();
        res.json(roles);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener roles de cuadrilla' });
    }
};

exports.create = async (req, res) => {
    try {
        const { nombre, zona, latitud, longitud } = req.body;
        const cuadrilla = await cuadrillaService.createCuadrilla(nombre, zona, latitud, longitud);
        res.status(201).json(cuadrilla);
    } catch (err) {
        res.status(500).json({ error: 'Error al crear cuadrilla' });
    }
};

exports.addMember = async (req, res) => {
    try {
        const { userId, cuadrillaId, rolCuadrillaId } = req.body;
        const asignacion = await cuadrillaService.assignMember(userId, cuadrillaId, rolCuadrillaId);
        res.status(201).json(asignacion);
    } catch (err) {
        res.status(500).json({ error: 'Error al asignar miembro' });
    }
};

exports.getDetails = async (req, res) => {
    try {
        const miembros = await cuadrillaService.getMiembrosByCuadrilla(req.params.id);
        res.json(miembros);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener detalles' });
    }
};

exports.getAvailableCount = async (req, res) => {
    try {
        const count = await cuadrillaService.getAvailableVolunteersCount();
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener voluntarios disponibles' });
    }
};

exports.autoGenerate = async (req, res) => {
    try {
        const { nombre, zona, count, latitud, longitud } = req.body;
        const result = await cuadrillaService.autoGenerateCuadrilla(nombre, zona, count, latitud, longitud);
        res.status(201).json(result);
    } catch (err) {
        console.error('Error en autoGenerate:', err);
        res.status(500).json({ error: err.message || 'Error interno al generar cuadrilla' });
    }
};
