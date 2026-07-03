import AppDataSource from '../config/db.js';
import { IsNull } from 'typeorm';
import CuadrillaSchema from '../entity/Cuadrilla.entity.js';
import RoleCuadrillaSchema from '../entity/RoleCuadrilla.entity.js';
import CuadrillaMiembroSchema from '../entity/CuadrillaMiembro.entity.js';
import UserSchema from '../entity/User.entity.js';
import HerramientasSchema from '../entity/Herramientas.entity.js';
import { createPrestamoService, registrarDevolucionService } from './prestamosService.js';
import PrestamoHerramientaSchema from '../entity/PrestamoHerramienta.entity.js';

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
    return await AppDataSource.query(query);
};

const createCuadrilla = async (nombre, zona, latitud = null, longitud = null) => {
    const cuadrillaRepo = AppDataSource.getRepository(CuadrillaSchema);
    const newCuadrilla = cuadrillaRepo.create({
        nombre,
        zona,
        latitud: latitud ? parseFloat(latitud) : null,
        longitud: longitud ? parseFloat(longitud) : null
    });
    return await cuadrillaRepo.save(newCuadrilla);
};

const assignMember = async (userId, cuadrillaId, rolCuadrillaId) => {
    const uId = parseInt(userId, 10);
    const cId = parseInt(cuadrillaId, 10);
    const rcId = parseInt(rolCuadrillaId, 10);

    const roleCuadrillaRepo = AppDataSource.getRepository(RoleCuadrillaSchema);
    const role = await roleCuadrillaRepo.findOneBy({ id: rcId });
    if (role) {
        const roleName = role.nombre;
        if (roleName === 'Capataz de Zona' || roleName === 'Voluntario Senior') {
            const memberRepo = AppDataSource.getRepository(CuadrillaMiembroSchema);
            const existingLeaders = await memberRepo.createQueryBuilder("cm")
                .leftJoin("users", "u", "cm.user_id = u.id")
                .leftJoin("roles_cuadrilla", "rc", "cm.rol_cuadrilla_id = rc.id")
                .select(["u.name AS name", "rc.nombre AS cargo"])
                .where("cm.cuadrilla_id = :cId", { cId })
                .andWhere("rc.nombre IN ('Capataz de Zona', 'Voluntario Senior')")
                .getRawMany();
            
            if (existingLeaders.length > 0) {
                throw new Error(`Esta cuadrilla ya cuenta con un líder asignado: ${existingLeaders[0].name} (${existingLeaders[0].cargo}).`);
            }
        }
    }

    const memberRepo = AppDataSource.getRepository(CuadrillaMiembroSchema);
    const newMember = memberRepo.create({
        user_id: uId,
        cuadrilla_id: cId,
        rol_cuadrilla_id: rcId
    });
    return await memberRepo.save(newMember);
};

const unassignMember = async (userId, cuadrillaId) => {
    const uId = parseInt(userId, 10);
    const cId = parseInt(cuadrillaId, 10);
    const memberRepo = AppDataSource.getRepository(CuadrillaMiembroSchema);
    const member = await memberRepo.findOneBy({ user_id: uId, cuadrilla_id: cId });
    if (member) {
        await memberRepo.remove(member);
    }
    return member;
};

const getMiembrosByCuadrilla = async (cuadrillaId) => {
    const query = `
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
        WHERE cm.cuadrilla_id = $1`;
    return await AppDataSource.query(query, [parseInt(cuadrillaId, 10)]);
};

const getRolesCuadrilla = async () => {
    const roleCuadrillaRepo = AppDataSource.getRepository(RoleCuadrillaSchema);
    return await roleCuadrillaRepo.find({
        order: { id: "ASC" }
    });
};

const getAvailableVolunteersCount = async () => {
    const userRepo = AppDataSource.getRepository(UserSchema);
    const subQuery = AppDataSource.getRepository(CuadrillaMiembroSchema)
        .createQueryBuilder("cm")
        .select("cm.user_id");

    const countRes = await userRepo.createQueryBuilder("user")
        .select("COUNT(*)", "count")
        .where("user.role_id = 2")
        .andWhere("user.id NOT IN (" + subQuery.getQuery() + ")")
        .getRawOne();
    
    return parseInt(countRes.count, 10);
};

const autoGenerateCuadrilla = async (nombre, zona, count, latitud, longitud, meta_herramientas = 5, herramientas_requeridas = null) => {
    const cuadrillaRepo = AppDataSource.getRepository(CuadrillaSchema);
    const memberRepo = AppDataSource.getRepository(CuadrillaMiembroSchema);
    const roleCuadrillaRepo = AppDataSource.getRepository(RoleCuadrillaSchema);
    const userRepo = AppDataSource.getRepository(UserSchema);

    const targetCount = count ? parseInt(count, 10) : 0;
    const lat = latitud ? parseFloat(latitud) : null;
    const lng = longitud ? parseFloat(longitud) : null;
    const metaHerr = meta_herramientas ? parseInt(meta_herramientas, 10) : 5;

    // Si la cantidad es 0 o menor, creamos la cuadrilla sin miembros asociados.
    if (targetCount <= 0) {
        const newCuadrilla = cuadrillaRepo.create({
            nombre,
            zona,
            estado: 'PENDIENTE',
            latitud: lat,
            longitud: lng,
            meta_voluntarios: 5,
            meta_herramientas: metaHerr,
            herramientas_requeridas: herramientas_requeridas || null
        });
        const saved = await cuadrillaRepo.save(newCuadrilla);
        return {
            ...saved,
            miembros_count: 0,
            capataz_nombre: null,
            capataz_rol: null,
            herramientas: []
        };
    }

    // 1. Obtener voluntarios disponibles (incluyendo 1 potencial capataz)
    const subQuery = memberRepo.createQueryBuilder("cm").select("cm.user_id");
    const availableVolunteers = await userRepo.createQueryBuilder("user")
        .select("user.id", "id")
        .where("user.role_id = 2")
        .andWhere("user.id NOT IN (" + subQuery.getQuery() + ")")
        .limit(targetCount)
        .getRawMany();

    if (availableVolunteers.length < 1) {
        throw new Error('No hay suficientes voluntarios disponibles');
    }

    // 2. Crear la nueva cuadrilla con nombre personalizado, coordenadas, META y meta de herramientas
    const newCuadrilla = cuadrillaRepo.create({
        nombre,
        zona,
        estado: 'PENDIENTE',
        latitud: lat,
        longitud: lng,
        meta_voluntarios: targetCount,
        meta_herramientas: metaHerr,
        herramientas_requeridas: herramientas_requeridas || null
    });
    const savedCuadrilla = await cuadrillaRepo.save(newCuadrilla);

    // 3. Obtener IDs de roles (Capataz y Voluntario)
    const roles = await roleCuadrillaRepo.createQueryBuilder("rc")
        .where("rc.nombre IN ('Capataz de Zona', 'Voluntario')")
        .getMany();
    
    const capatazRole = roles.find(r => r.nombre === 'Capataz de Zona');
    const voluntarioRole = roles.find(r => r.nombre === 'Voluntario');

    // 4. Asignar los voluntarios: El primero será Capataz, el resto Voluntarios
    for (let i = 0; i < availableVolunteers.length; i++) {
        const v = availableVolunteers[i];
        const roleId = (i === 0) ? capatazRole.id : voluntarioRole.id;

        const newMember = memberRepo.create({
            user_id: v.id,
            cuadrilla_id: savedCuadrilla.id,
            rol_cuadrilla_id: roleId
        });
        await memberRepo.save(newMember);
    }

    return {
        ...savedCuadrilla,
        miembros_count: availableVolunteers.length,
        capataz_nombre: availableVolunteers.length > 0 ? 'Asignado' : null,
        capataz_rol: availableVolunteers.length > 0 ? 'Capataz de Zona' : null,
        herramientas: []
    };
};

const deleteCuadrilla = async (id) => {
    const cId = parseInt(id, 10);
    const cuadrillaRepo = AppDataSource.getRepository(CuadrillaSchema);
    const memberRepo = AppDataSource.getRepository(CuadrillaMiembroSchema);

    // Eliminar miembros
    await memberRepo.createQueryBuilder()
        .delete()
        .where("cuadrilla_id = :cId", { cId })
        .execute();

    const cuadrilla = await cuadrillaRepo.findOneBy({ id: cId });
    if (cuadrilla) {
        await cuadrillaRepo.remove(cuadrilla);
    }
    return cuadrilla;
};

const updateCuadrilla = async (id, data) => {
    const cId = parseInt(id, 10);
    const cuadrillaRepo = AppDataSource.getRepository(CuadrillaSchema);
    const cuadrilla = await cuadrillaRepo.findOneBy({ id: cId });
    if (!cuadrilla) {
        throw new Error("Cuadrilla no encontrada");
    }

    const { nombre, zona, latitud, longitud, meta_voluntarios, meta_herramientas, estado, herramientas_requeridas } = data;
    
    cuadrilla.nombre = nombre;
    cuadrilla.zona = zona;
    cuadrilla.latitud = (latitud === '' || latitud === undefined || latitud === null) ? null : parseFloat(latitud);
    cuadrilla.longitud = (longitud === '' || longitud === undefined || longitud === null) ? null : parseFloat(longitud);
    cuadrilla.meta_voluntarios = meta_voluntarios ? parseInt(meta_voluntarios, 10) : 5;
    cuadrilla.meta_herramientas = meta_herramientas ? parseInt(meta_herramientas, 10) : 5;
    cuadrilla.estado = estado || 'PENDIENTE';
    cuadrilla.herramientas_requeridas = herramientas_requeridas || null;

    return await cuadrillaRepo.save(cuadrilla);
};

const autoAssignToolsToCuadrilla = async (cuadrillaId) => {
    const cId = parseInt(cuadrillaId, 10);
    const cuadrillaRepo = AppDataSource.getRepository(CuadrillaSchema);
    const toolRepo = AppDataSource.getRepository(HerramientasSchema);

    // 1. Obtener la cuadrilla para saber la meta y requerimientos específicos
    const cuadrilla = await cuadrillaRepo.findOneBy({ id: cId });
    if (!cuadrilla) {
        throw new Error('Cuadrilla no encontrada');
    }
    
    const targetMeta = cuadrilla.meta_herramientas || 5;
    const herramientasRequeridas = cuadrilla.herramientas_requeridas;

    // 2. Obtener miembros de la cuadrilla
    const miembros = await getMiembrosByCuadrilla(cId);
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
    const herramientasLibres = await toolRepo.find({
        where: { assigned_to: IsNull(), estado: 'disponible' },
        order: { id: 'ASC' }
    });

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

const getAvailableTools = async () => {
    const toolRepo = AppDataSource.getRepository(HerramientasSchema);
    return await toolRepo.find({
        where: { assigned_to: IsNull(), estado: 'disponible' },
        order: { nombre: 'ASC' }
    });
};

const assignToolToUser = async (userId, toolId) => {
    return await createPrestamoService(parseInt(toolId, 10), parseInt(userId, 10), 'Asignado manualmente');
};

const returnTool = async (toolId) => {
    const prestamoRepo = AppDataSource.getRepository(PrestamoHerramientaSchema);
    const activePrestamo = await prestamoRepo.findOneBy({
        herramienta_id: parseInt(toolId, 10),
        estado_prestamo: 'prestado'
    });
    if (!activePrestamo) {
        throw new Error('No se encontró un préstamo activo para esta herramienta.');
    }
    return await registrarDevolucionService(activePrestamo.id, 'Devuelto manualmente');
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
    autoAssignToolsToCuadrilla,
    getAvailableTools,
    assignToolToUser,
    returnTool
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
    autoAssignToolsToCuadrilla,
    getAvailableTools,
    assignToolToUser,
    returnTool
};

export default cuadrillaService;
