const pool = require('../config/db');
const bcrypt = require('bcrypt');

const createUser = async (userData) => {
    const { name, email, password, role_id } = userData;

    // Si no viene un role_id, asignamos el ID 2 (Voluntario) por defecto
    const finalRoleId = role_id || 2;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
        INSERT INTO users (name, email, password, role_id) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id, name, email, role_id
    `;
    const values = [name, email, hashedPassword, finalRoleId];

    const result = await pool.query(query, values);
    return result.rows[0];
};const mapUserRow = (row) => {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        role_id: row.role_id,
        role_nombre: row.role_nombre,
        telefono: row.telefono,
        comuna: row.comuna,
        habilidades: row.habilidades,
        cuadrilla: row.cuadrilla_id ? {
            id: row.cuadrilla_id,
            nombre: row.cuadrilla_nombre,
            rol_cuadrilla_id: row.rol_cuadrilla_id,
            rol_cuadrilla_nombre: row.rol_cuadrilla_nombre,
            latitud: row.cuadrilla_latitud ? parseFloat(row.cuadrilla_latitud) : null,
            longitud: row.cuadrilla_longitud ? parseFloat(row.cuadrilla_longitud) : null
        } : null
    };
};

const getAllUsers = async () => {
    const query = `
        SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.role_id, 
            r.nombre AS role_nombre, 
            u.telefono, 
            u.comuna, 
            u.habilidades,
            c.id AS cuadrilla_id,
            c.nombre AS cuadrilla_nombre,
            rc.id AS rol_cuadrilla_id,
            rc.nombre AS rol_cuadrilla_nombre,
            c.latitud AS cuadrilla_latitud,
            c.longitud AS cuadrilla_longitud
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN cuadrilla_miembros cm ON u.id = cm.user_id
        LEFT JOIN cuadrillas c ON cm.cuadrilla_id = c.id
        LEFT JOIN roles_cuadrilla rc ON cm.rol_cuadrilla_id = rc.id
        ORDER BY u.name ASC
    `;
    const result = await pool.query(query);
    return result.rows.map(mapUserRow);
};

const getUserById = async (id) => {
    const query = `
        SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.role_id, 
            r.nombre AS role_nombre, 
            u.telefono, 
            u.comuna, 
            u.habilidades,
            c.id AS cuadrilla_id,
            c.nombre AS cuadrilla_nombre,
            rc.id AS rol_cuadrilla_id,
            rc.nombre AS rol_cuadrilla_nombre,
            c.latitud AS cuadrilla_latitud,
            c.longitud AS cuadrilla_longitud
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        LEFT JOIN cuadrilla_miembros cm ON u.id = cm.user_id
        LEFT JOIN cuadrillas c ON cm.cuadrilla_id = c.id
        LEFT JOIN roles_cuadrilla rc ON cm.rol_cuadrilla_id = rc.id
        WHERE u.id = $1
    `;
    const result = await pool.query(query, [id]);
    return mapUserRow(result.rows[0]);
};

const deleteUser = async (id) => {
    await pool.query('DELETE FROM cuadrilla_miembros WHERE user_id = $1', [id]);
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return { message: 'Usuario eliminado' };
};

const updateUser = async (id, userData) => {
    const { name, email, role_id, telefono, comuna, habilidades } = userData;
    const result = await pool.query(
        'UPDATE users SET name = $1, email = $2, role_id = $3, telefono = $4, comuna = $5, habilidades = $6 WHERE id = $7 RETURNING id, name, email, role_id, telefono, comuna, habilidades',
        [name, email, role_id, telefono, comuna, habilidades, id]
    );
    return result.rows[0];
};

const getSystemRoles = async () => {
    const result = await pool.query('SELECT id, nombre, descripcion FROM roles ORDER BY id');
    return result.rows;
};

const getAvailableVolunteers = async () => {
    const query = `
        SELECT u.id, u.name, u.email, u.role_id, r.nombre AS role_nombre, u.telefono, u.comuna, u.habilidades 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.role_id = 2 AND u.id NOT IN (SELECT user_id FROM cuadrilla_miembros)
        ORDER BY u.name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

module.exports = { 
    createUser, 
    getAllUsers, 
    getUserById, 
    getAvailableVolunteers,
    deleteUser, 
    updateUser,
    getSystemRoles 
};