const pool = require('../config/db');

const createCuadrilla = async (nombre, zona) => {
    const res = await pool.query(
        'INSERT INTO cuadrillas (nombre, zona) VALUES ($1, $2) RETURNING *',
        [nombre, zona]
    );
    return res.rows[0];
};

const assignMember = async (userId, cuadrillaId, rolCuadrillaId) => {
    const res = await pool.query(
        'INSERT INTO cuadrilla_miembros (user_id, cuadrilla_id, rol_cuadrilla_id) VALUES ($1, $2, $3) RETURNING *',
        [userId, cuadrillaId, rolCuadrillaId]
    );
    return res.rows[0];
};

const getMiembrosByCuadrilla = async (cuadrillaId) => {
    const res = await pool.query(`
        SELECT u.name, u.email, rc.nombre as cargo
        FROM cuadrilla_miembros cm
        JOIN users u ON cm.user_id = u.id
        JOIN roles_cuadrilla rc ON cm.rol_cuadrilla_id = rc.id
        WHERE cm.cuadrilla_id = $1`,
        [cuadrillaId]
    );
    return res.rows;
};

module.exports = { createCuadrilla, assignMember, getMiembrosByCuadrilla };