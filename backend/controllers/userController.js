import userService from '../services/userService.js';

export const getAll = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

export const getAvailable = async (req, res) => {
    try {
        const users = await userService.getAvailableVolunteers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener voluntarios disponibles' });
    }
};

export const getById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};

export const remove = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
};

export const getRoles = async (req, res) => {
    try {
        const roles = await userService.getSystemRoles();
        res.json(roles);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener roles' });
    }
};

export const update = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
};

export const create = async (req, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'No autorizado' });
    if (user.role_id !== 1) return res.status(403).json({ error: 'Acceso prohibido: solo administradores' });

    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message || 'Error al crear usuario' });
    }
};

const userController = {
    getAll,
    getAvailable,
    getById,
    remove,
    getRoles,
    update,
    create
};

export default userController;
