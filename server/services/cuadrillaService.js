import pool from '../config/db.js';
import { createPrestamoService } from './prestamosService.js';

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
            c.meta_herramientas,
            c.herramientas_requeridas,
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
            ) AS capataz_rol,
            COALESCE(
                (SELECT json_agg(json_build_object('id', h.id, 'nombre', h.nombre, 'voluntario', u.name))
                 FROM cuadrilla_miembros cm3
                 JOIN users u ON cm3.user_id = u.id
                 JOIN herramientas h ON h.assigned_to = u.id
                 WHERE cm3.cuadrilla_id = c.id),
                '[]'::json
            ) AS herramientas,
            COALESCE(
                (SELECT json_agg(json_build_object(
                    'user_id', u.id,
                    'name', u.name,
                    'email', u.email,
                    'cargo', rc.nombre,
                    'herramientas', COALESCE(
                        (SELECT json_agg(json_build_object('id', h2.id, 'nombre', h2.nombre, 'estado', h2.estado)) 
                         FROM herramientas h2 
                         WHERE h2.assigned_to = u.id),
                        '[]'::json
                    )
                 ))
                 FROM cuadrilla_miembros cm4
                 JOIN users u ON cm4.user_id = u.id
                 JOIN roles_cuadrilla rc ON cm4.rol_cuadrilla_id = rc.id
                 WHERE cm4.cuadrilla_id = c.id),
                '[]'::json
            ) AS miembros
        FROM cuadrillas c
        LEFT JOIN cuadrilla_miembros cm ON c.id = cm.cuadrilla_id
        GROUP BY c.id, c.nombre, c.zona, c.estado, c.latitud, c.longitud, c.meta_voluntarios, c.meta_herramientas, c.herramientas_requeridas
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
    // Verificar si el rol que se quiere asignar es Capataz de Zona o Voluntario Senior
    const roleRes = await pool.query('SELECT nombre FROM roles_cuadrilla WHERE id = $1', [rolCuadrillaId]);
    if (roleRes.rows.length > 0) {
        const roleName = roleRes.rows[0].nombre;
        if (roleName === 'Capataz de Zona' || roleName === 'Voluntario Senior') {
            // Buscar si ya existe algún Capataz de Zona o Voluntario Senior en la cuadrilla
            const existingRes = await pool.query(`
                SELECT u.name, rc.nombre as cargo
                FROM cuadrilla_miembros cm
                JOIN users u ON cm.user_id = u.id
                JOIN roles_cuadrilla rc ON cm.rol_cuadrilla_id = rc.id
                WHERE cm.cuadrilla_id = $1 AND rc.nombre IN ('Capataz de Zona', 'Voluntario Senior')
            `, [cuadrillaId]);
            
            if (existingRes.rows.length > 0) {
                throw new Error(`Esta cuadrilla ya cuenta con un líder asignado: ${existingRes.rows[0].name} (${existingRes.rows[0].cargo}).`);
            }
        }
    }

    const res = await pool.query(
        'INSERT INTO cuadrilla_miembros (user_id, cuadrilla_id, rol_cuadrilla_id) VALUES ($1, $2, $3) RETURNING *',
        [userId, cuadrillaId, rolCuadrillaId]
    );
    return res.rows[0];
};

const unassignMember = async (userId, cuadrillaId) => {
    const res = await pool.query(
        'DELETE FROM cuadrilla_miembros WHERE user_id = $1 AND cuadrilla_id = $2 RETURNING *',
        [userId, cuadrillaId]
    );
    return res.rows[0];
};

const getMiembrosByCuadrilla = async (cuadrillaId) => {
    const res = await pool.query(`
        SELECT u.id as user_id, u.name, u.email, rc.nombre as cargo,
          COALESCE(
            (SELECT json_agg(json_build_object('id', h.id, 'nombre', h.nombre, 'estado', h.estado)) 
             FROM herramientas h 
             WHERE h.assigned_to = u.id), 
            '[]'::json
          ) AS herramientas
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

const autoGenerateCuadrilla = async (nombre, zona, count, latitud, longitud, meta_herramientas = 5, herramientas_requeridas = null) => {
    // Si la cantidad es 0 o menor, creamos la cuadrilla sin miembros asociados.
    if (!count || count <= 0) {
        const newCuadrillaRes = await pool.query(
            'INSERT INTO cuadrillas (nombre, zona, estado, latitud, longitud, meta_voluntarios, meta_herramientas, herramientas_requeridas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [nombre, zona, 'PENDIENTE', latitud || null, longitud || null, 5, meta_herramientas, herramientas_requeridas || null]
        );
        return {
            ...newCuadrillaRes.rows[0],
            miembros_count: 0,
            capataz_nombre: null,
            capataz_rol: null,
            herramientas: []
        };
    }

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

    // 2. Crear la nueva cuadrilla con nombre personalizado, coordenadas, META y meta de herramientas
    const newCuadrillaRes = await pool.query(
        'INSERT INTO cuadrillas (nombre, zona, estado, latitud, longitud, meta_voluntarios, meta_herramientas, herramientas_requeridas) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [nombre, zona, 'PENDIENTE', latitud || null, longitud || null, count, meta_herramientas, herramientas_requeridas || null]
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
        capataz_rol: availableVolunteers.length > 0 ? 'Capataz de Zona' : null,
        herramientas: []
    };
};

const deleteCuadrilla = async (id) => {
    await pool.query('DELETE FROM cuadrilla_miembros WHERE cuadrilla_id = $1', [id]);
    const res = await pool.query('DELETE FROM cuadrillas WHERE id = $1 RETURNING *', [id]);
    return res.rows[0];
};

const updateCuadrilla = async (id, data) => {
    const { nombre, zona, latitud, longitud, meta_voluntarios, meta_herramientas, estado, herramientas_requeridas } = data;
    const lat = (latitud === '' || latitud === undefined || latitud === null) ? null : parseFloat(latitud);
    const lng = (longitud === '' || longitud === undefined || longitud === null) ? null : parseFloat(longitud);
    const res = await pool.query(
        `UPDATE cuadrillas 
         SET nombre = $1, zona = $2, latitud = $3, longitud = $4, meta_voluntarios = $5, meta_herramientas = $6, estado = $7, herramientas_requeridas = $8 
         WHERE id = $9 RETURNING *`,
        [nombre, zona, lat, lng, meta_voluntarios || 5, meta_herramientas || 5, estado || 'PENDIENTE', herramientas_requeridas || null, id]
    );
    return res.rows[0];
};

const autoAssignToolsToCuadrilla = async (cuadrillaId) => {
    // 1. Obtener la cuadrilla para saber la meta y requerimientos específicos
    const cuadrillaRes = await pool.query('SELECT meta_herramientas, herramientas_requeridas FROM cuadrillas WHERE id = $1', [cuadrillaId]);
    if (cuadrillaRes.rows.length === 0) {
        throw new Error('Cuadrilla no encontrada');
    }
    const { meta_herramientas: metaHerramientas, herramientas_requeridas: herramientasRequeridas } = cuadrillaRes.rows[0];
    const targetMeta = metaHerramientas || 5;

    // 2. Obtener miembros de la cuadrilla
    const miembros = await getMiembrosByCuadrilla(cuadrillaId);
    if (miembros.length === 0) {
        throw new Error('No hay miembros asignados a esta cuadrilla.');
    }

    // 3. Contar herramientas ya asignadas
    let herramientasAsignadasCount = 0;
    for (const m of miembros) {
        if (m.herramientas) {
            herramientasAsignadasCount += m.herramientas.length;
        }
    }

    let herramientasNecesitadas = targetMeta - herramientasAsignadasCount;
    if (herramientasNecesitadas <= 0) {
        return { assignedCount: 0, message: 'La cuadrilla ya alcanzó o supera la meta de herramientas.' };
    }

    // 4. Buscar herramientas libres (disponibles)
    const herramientasLibresRes = await pool.query(
        "SELECT id, nombre FROM herramientas WHERE assigned_to IS NULL AND estado = 'disponible' ORDER BY id"
    );
    let herramientasLibres = herramientasLibresRes.rows;

    if (herramientasLibres.length === 0) {
        throw new Error('No hay herramientas libres y disponibles en el inventario para asignar.');
    }

    const toolsToAssign = [];

    // 5. Si hay requerimientos específicos, intentar emparejarlos primero
    if (herramientasRequeridas && herramientasRequeridas.trim()) {
        const reqItems = herramientasRequeridas.split(',')
            .map(item => item.trim())
            .filter(Boolean);

        for (const item of reqItems) {
            // Regex para buscar cantidad opcional (ej: "2 Martillos" o "Martillo")
            const match = item.match(/^(\d+)\s+(.+)$/);
            let qty = 1;
            let term = item;
            if (match) {
                qty = parseInt(match[1], 10) || 1;
                term = match[2];
            }
            
            // Limpiar plural básico
            const cleanTerm = term.replace(/s$/i, '').trim().toLowerCase();
            
            // Buscar coincidencias
            let matchedQty = 0;
            for (let i = 0; i < herramientasLibres.length; i++) {
                const herr = herramientasLibres[i];
                if (herr.nombre.toLowerCase().includes(cleanTerm)) {
                    toolsToAssign.push(herr);
                    herramientasLibres.splice(i, 1); // Remover del listado general
                    i--;
                    matchedQty++;
                    if (matchedQty >= qty) break;
                }
            }
        }
    }

    // Truncar si la cantidad de herramientas específicas supera la necesidad actual
    let finalAssignList = toolsToAssign.slice(0, herramientasNecesitadas);
    let remainingNeeded = herramientasNecesitadas - finalAssignList.length;

    // 6. Si aún faltan herramientas para cumplir con la meta general, rellenar con cualquier herramienta disponible
    if (remainingNeeded > 0 && herramientasLibres.length > 0) {
        const fillerTools = herramientasLibres.slice(0, remainingNeeded);
        finalAssignList.push(...fillerTools);
    }

    if (finalAssignList.length === 0) {
        throw new Error('No se encontraron herramientas disponibles que coincidan con los requerimientos específicos o generales.');
    }

    // 7. Registrar los préstamos distribuyendo equitativamente entre voluntarios
    let assignedCount = 0;
    for (let i = 0; i < finalAssignList.length; i++) {
        const herr = finalAssignList[i];
        const voluntario = miembros[i % miembros.length];
        
        await createPrestamoService(herr.id, voluntario.user_id, 'Asignación automática por cuadrilla');
        assignedCount++;
    }

    let msg = `Se asignaron automáticamente ${assignedCount} herramientas a los miembros de la cuadrilla.`;
    if (herramientasRequeridas) {
        msg += ` Se intentó priorizar: "${herramientasRequeridas}".`;
    }

    return {
        assignedCount,
        message: msg
    };
};

const cuadrillaService = {
    getAllCuadrillas,
    createCuadrilla,
    assignMember,
    unassignMember,
    getMiembrosByCuadrilla,
    getRolesCuadrilla,
    getAvailableVolunteersCount,
    autoGenerateCuadrilla,
    deleteCuadrilla,
    updateCuadrilla,
    autoAssignToolsToCuadrilla
};

export {
    getAllCuadrillas,
    createCuadrilla,
    assignMember,
    unassignMember,
    getMiembrosByCuadrilla,
    getRolesCuadrilla,
    getAvailableVolunteersCount,
    autoGenerateCuadrilla,
    deleteCuadrilla,
    updateCuadrilla,
    autoAssignToolsToCuadrilla
};

export default cuadrillaService;
