const userService = require('../services/userService');

exports.getAll = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

exports.getAvailable = async (req, res) => {
    try {
        const users = await userService.getAvailableVolunteers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener voluntarios disponibles' });
    }
};

exports.getById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};

exports.remove = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};

exports.getRoles = async (req, res) => {
    try {
        const roles = await userService.getSystemRoles();
        res.json(roles);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener roles' });
    }
};

exports.update = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};
