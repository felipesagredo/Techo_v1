const pool = require('../config/db');

const getAllCuadrillas = async () => {
    const query = `
        SELECT 
            c.id, 
            c.nombre, 
            c.zona, 
            c.estado,
            COUNT(cm.user_id) AS miembros_count,
            (
                SELECT u.name 
                FROM cuadrilla_miembros cm2
                JOIN roles_cuadrilla rc ON cm2.rol_cuadrilla_id = rc.id
                JOIN users u ON cm2.user_id = u.id
                WHERE cm2.cuadrilla_id = c.id 
                  AND rc.nombre IN ('Capataz de Zona', 'Voluntario Senior')
                LIMIT 1
            ) AS capataz_nombre,
            (
                SELECT rc.nombre 
                FROM cuadrilla_miembros cm2
                JOIN roles_cuadrilla rc ON cm2.rol_cuadrilla_id = rc.id
                WHERE cm2.cuadrilla_id = c.id 
                  AND rc.nombre IN ('Capataz de Zona', 'Voluntario Senior')
                LIMIT 1
            ) AS capataz_rol
        FROM cuadrillas c
        LEFT JOIN cuadrilla_miembros cm ON c.id = cm.cuadrilla_id
        GROUP BY c.id
        ORDER BY c.id;
    `;
    const res = await pool.query(query);
    return res.rows;
};

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
const getRolesCuadrilla = async () => {
    const res = await pool.query('SELECT id, nombre FROM roles_cuadrilla ORDER BY id');
    return res.rows;
};

module.exports = { createCuadrilla, assignMember, getMiembrosByCuadrilla, getAllCuadrillas, getRolesCuadrilla };