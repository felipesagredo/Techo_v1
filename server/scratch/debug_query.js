const pool = require('../config/db');

const testQuery = async () => {
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
    try {
        console.log('Running query...');
        const res = await pool.query(query);
        console.log('Success! Rows:', res.rows.length);
        process.exit(0);
    } catch (err) {
        console.error('Query failed:', err.message);
        process.exit(1);
    }
};

testQuery();
