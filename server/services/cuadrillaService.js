const pool = require('../config/db');

const getAllCuadrillas = async () => {
    const query = `
        SELECT 
            c.id, 
            c.nombre, 
            c.zona, 
            c.estado,
            c.latitud,
            c.longitud,
            c.meta_voluntarios,
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
        GROUP BY c.id, c.nombre, c.zona, c.estado, c.latitud, c.longitud, c.meta_voluntarios
        ORDER BY c.id;
    `;
    const res = await pool.query(query);
    return res.rows;
};

const createCuadrilla = async (nombre, zona, latitud = null, longitud = null) => {
    const res = await pool.query(
        'INSERT INTO cuadrillas (nombre, zona, latitud, longitud) VALUES ($1, $2, $3, $4) RETURNING *',
        [nombre, zona, latitud, longitud]
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

const getAvailableVolunteersCount = async () => {
    const query = `
        SELECT COUNT(*) 
        FROM users u
        LEFT JOIN cuadrilla_miembros cm ON u.id = cm.user_id
        WHERE cm.user_id IS NULL AND u.role_id = 2
    `;
    const res = await pool.query(query);
    return parseInt(res.rows[0].count);
};

const autoGenerateCuadrilla = async (nombre, zona, count, latitud, longitud) => {
    // 1. Obtener voluntarios disponibles (incluyendo 1 potencial capataz)
    const volunteerQuery = `
        SELECT id FROM users 
        WHERE role_id = 2 AND id NOT IN (SELECT user_id FROM cuadrilla_miembros)
        LIMIT $1
    `;
    const volunteersRes = await pool.query(volunteerQuery, [count]);
    const availableVolunteers = volunteersRes.rows;

    if (availableVolunteers.length < 1) {
        throw new Error('No hay suficientes voluntarios disponibles');
    }

    // 2. Crear la nueva cuadrilla con nombre personalizado, coordenadas y META
    const newCuadrillaRes = await pool.query(
        'INSERT INTO cuadrillas (nombre, zona, estado, latitud, longitud, meta_voluntarios) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [nombre, zona, 'PENDIENTE', latitud, longitud, count]
    );
    const newCuadrilla = newCuadrillaRes.rows[0];

    // 3. Obtener IDs de roles (Capataz y Voluntario)
    const rolesRes = await pool.query("SELECT id, nombre FROM roles_cuadrilla WHERE nombre IN ('Capataz de Zona', 'Voluntario')");
    const capatazRole = rolesRes.rows.find(r => r.nombre === 'Capataz de Zona');
    const voluntarioRole = rolesRes.rows.find(r => r.nombre === 'Voluntario');

    // 4. Asignar los voluntarios: El primero será Capataz, el resto Voluntarios
    for (let i = 0; i < availableVolunteers.length; i++) {
        const v = availableVolunteers[i];
        const roleId = (i === 0) ? capatazRole.id : voluntarioRole.id;
        
        await pool.query(
            'INSERT INTO cuadrilla_miembros (user_id, cuadrilla_id, rol_cuadrilla_id) VALUES ($1, $2, $3)',
            [v.id, newCuadrilla.id, roleId]
        );
    }

    return { 
        ...newCuadrilla, 
        miembros_count: availableVolunteers.length,
        capataz_nombre: availableVolunteers.length > 0 ? 'Asignado' : null,
        capataz_rol: availableVolunteers.length > 0 ? 'Capataz de Zona' : null
    };
};

module.exports = { 
    createCuadrilla, 
    assignMember, 
    getMiembrosByCuadrilla, 
    getAllCuadrillas, 
    getRolesCuadrilla,
    getAvailableVolunteersCount,
    autoGenerateCuadrilla
};