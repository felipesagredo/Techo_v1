import AppDataSource from '../config/db.js';
import { IsNull } from 'typeorm';
import CuadrillaSchema from '../entity/Cuadrilla.entity.js';
import RoleCuadrillaSchema from '../entity/RoleCuadrilla.entity.js';
import CuadrillaMiembroSchema from '../entity/CuadrillaMiembro.entity.js';
import UserSchema from '../entity/User.entity.js';
import HerramientasSchema from '../entity/Herramientas.entity.js';
import { createPrestamoService, registrarDevolucionService } from './prestamosService.js';
import PrestamoHerramientaSchema from '../entity/PrestamoHerramienta.entity.js';
import MaterialesSchema from '../entity/Materiales.entity.js';
import AsignacionMaterialSchema from '../entity/AsignacionMaterial.entity.js';
import { autoAssignMaterialsToCuadrillaService } from './asignacionMaterialService.js';

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
            c.materiales_requeridos,
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
                 JOIN prestamos_herramientas ph ON ph.user_id = u.id AND ph.estado_prestamo = 'prestado'
                 JOIN herramientas h ON ph.herramienta_id = h.id
                 WHERE cm3.cuadrilla_id = c.id),
                '[]'::json
            ) AS herramientas,
            COALESCE(
                (SELECT json_agg(json_build_object('nombre', m.nombre_material, 'cantidad', am.cantidad_asignada))
                 FROM asignacion_materiales am
                 JOIN materiales m ON am.material_id = m.id
                 WHERE am.cuadrilla_id = c.id),
                '[]'::json
            ) AS materiales,
            COALESCE(
                (SELECT json_agg(json_build_object(
                    'user_id', u.id,
                    'name', u.name,
                    'email', u.email,
                    'cargo', rc.nombre,
                    'herramientas', COALESCE(
                        (SELECT json_agg(json_build_object('id', h2.id, 'nombre', h2.nombre, 'estado', h2.estado)) 
                         FROM prestamos_herramientas ph2
                         JOIN herramientas h2 ON ph2.herramienta_id = h2.id
                         WHERE ph2.user_id = u.id AND ph2.estado_prestamo = 'prestado'),
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
        GROUP BY c.id, c.nombre, c.zona, c.estado, c.latitud, c.longitud, c.meta_voluntarios, c.meta_herramientas, c.herramientas_requeridas, c.materiales_requeridos
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
             FROM prestamos_herramientas ph
             JOIN herramientas h ON ph.herramienta_id = h.id
             WHERE ph.user_id = u.id AND ph.estado_prestamo = 'prestado'), 
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

const autoGenerateCuadrilla = async (nombre, zona, count, latitud, longitud, meta_herramientas = 14, herramientas_requeridas = null) => {
    const cuadrillaRepo = AppDataSource.getRepository(CuadrillaSchema);
    const memberRepo = AppDataSource.getRepository(CuadrillaMiembroSchema);
    const roleCuadrillaRepo = AppDataSource.getRepository(RoleCuadrillaSchema);
    const userRepo = AppDataSource.getRepository(UserSchema);
    const toolRepo = AppDataSource.getRepository(HerramientasSchema);
    const materialRepo = AppDataSource.getRepository(MaterialesSchema);

    // Estandarizar parámetros para cuadrilla de medias aguas (1 jefe + 6 voluntarios)
    const targetCount = 7; 
    const lat = latitud ? parseFloat(latitud) : null;
    const lng = longitud ? parseFloat(longitud) : null;
    const metaHerr = 14; // 1 Sierra + 6 Martillo + 6 Huincha + 1 Caja de Clavos
    const reqHerr = '1 Sierra, 6 Martillo, 6 Huincha, 1 Caja de Clavos';

    // 1. Validar que existan suficientes voluntarios disponibles (7 libres)
    const subQuery = memberRepo.createQueryBuilder("cm").select("cm.user_id");
    const availableVolunteers = await userRepo.createQueryBuilder("user")
        .select("user.id", "id")
        .where("user.role_id = 2")
        .andWhere("user.id NOT IN (" + subQuery.getQuery() + ")")
        .limit(targetCount)
        .getRawMany();

    if (availableVolunteers.length < targetCount) {
        throw new Error(`Voluntarios insuficientes. Se requieren exactamente 7 voluntarios libres (1 jefe y 6 voluntarios) para conformar la cuadrilla, pero solo hay ${availableVolunteers.length} disponibles.`);
    }

    // 2. Validar stock de herramientas en el inventario
    const allTools = await toolRepo.find({
        where: { estado: 'disponible' }
    });
    const availableTools = allTools.filter(t => t.stock > 0);

    const sumStock = (arr) => arr.reduce((acc, t) => acc + t.stock, 0);
    const totalSierras = sumStock(availableTools.filter(t => t.nombre.toLowerCase().includes('sierra')));
    const totalMartillos = sumStock(availableTools.filter(t => t.nombre.toLowerCase().includes('martillo')));
    const totalHuinchas = sumStock(availableTools.filter(t => t.nombre.toLowerCase().includes('huincha')));
    const totalClavos = sumStock(availableTools.filter(t => t.nombre.toLowerCase().includes('clavo') || t.nombre.toLowerCase().includes('caja de clavos')));

    const missingTools = [];
    if (totalSierras < 1) missingTools.push(`Sierra (1 necesaria, ${totalSierras} disponibles)`);
    if (totalMartillos < 6) missingTools.push(`Martillo (6 necesarios, ${totalMartillos} disponibles)`);
    if (totalHuinchas < 6) missingTools.push(`Huincha (6 necesarias, ${totalHuinchas} disponibles)`);
    if (totalClavos < 1) missingTools.push(`Caja de Clavos (1 necesaria, ${totalClavos} disponibles)`);

    // 3. Validar stock de materiales en el inventario
    const materialsNeeded = [
        { nombre: 'Plancha de zinc', qty: 12 },
        { nombre: 'Madera de construcción', qty: 24 },
        { nombre: 'Tabla', qty: 40 },
        { nombre: 'Grava', qty: 5 },
        { nombre: 'Arena', qty: 5 }
    ];

    const missingMaterials = [];
    for (const m of materialsNeeded) {
        const material = await materialRepo.findOne({
            where: { nombre_material: m.nombre }
        });
        if (!material || material.cantidad < m.qty) {
            const has = material ? material.cantidad : 0;
            missingMaterials.push(`${m.nombre} (requerido: ${m.qty}, disponible: ${has})`);
        }
    }

    // Si falta stock de herramientas o materiales, lanzar error explícito
    if (missingTools.length > 0 || missingMaterials.length > 0) {
        let errMsg = 'Stock insuficiente en el inventario. ';
        if (missingTools.length > 0) {
            errMsg += `Herramientas faltantes: ${missingTools.join(', ')}. `;
        }
        if (missingMaterials.length > 0) {
            errMsg += `Materiales faltantes: ${missingMaterials.join(', ')}. `;
        }
        errMsg += 'Por favor, registre la llegada de nuevo stock en el inventario.';
        throw new Error(errMsg);
    }

    // 4. Crear la cuadrilla estándar
    const newCuadrilla = cuadrillaRepo.create({
        nombre,
        zona,
        estado: 'PENDIENTE',
        latitud: lat,
        longitud: lng,
        meta_voluntarios: targetCount,
        meta_herramientas: metaHerr,
        herramientas_requeridas: reqHerr,
        materiales_requeridos: 'plancha de zinc: 12, madera de construcción: 24, tabla: 40, grava: 5, arena: 5'
    });
    const savedCuadrilla = await cuadrillaRepo.save(newCuadrilla);

    // 5. Obtener roles de la base de datos
    const roles = await roleCuadrillaRepo.createQueryBuilder("rc")
        .where("rc.nombre IN ('Capataz de Zona', 'Voluntario')")
        .getMany();
    
    const capatazRole = roles.find(r => r.nombre === 'Capataz de Zona') || roles[0];
    const voluntarioRole = roles.find(r => r.nombre === 'Voluntario') || roles[1] || roles[0];

    // 6. Asignar los voluntarios: El primero será Capataz (Jefe), el resto Voluntarios
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

    // 7. Auto-asignar Herramientas por roles
    await autoAssignToolsToCuadrilla(savedCuadrilla.id);

    // 8. Auto-asignar Materiales para medias aguas
    await autoAssignMaterialsToCuadrillaService(savedCuadrilla.id);

    return {
        ...savedCuadrilla,
        miembros_count: availableVolunteers.length,
        capataz_nombre: 'Asignado',
        capataz_rol: 'Capataz de Zona',
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

    const { nombre, zona, latitud, longitud, meta_voluntarios, meta_herramientas, estado, herramientas_requeridas, materiales_requeridos } = data;
    
    cuadrilla.nombre = nombre;
    cuadrilla.zona = zona;
    cuadrilla.latitud = (latitud === '' || latitud === undefined || latitud === null) ? null : parseFloat(latitud);
    cuadrilla.longitud = (longitud === '' || longitud === undefined || longitud === null) ? null : parseFloat(longitud);
    cuadrilla.meta_voluntarios = meta_voluntarios ? parseInt(meta_voluntarios, 10) : 5;
    cuadrilla.meta_herramientas = meta_herramientas ? parseInt(meta_herramientas, 10) : 5;
    cuadrilla.estado = estado || 'PENDIENTE';
    cuadrilla.herramientas_requeridas = herramientas_requeridas || null;
    cuadrilla.materiales_requeridos = materiales_requeridos || null;

    return await cuadrillaRepo.save(cuadrilla);
};

const autoAssignToolsToCuadrilla = async (cuadrillaId) => {
    const cId = parseInt(cuadrillaId, 10);
    const cuadrillaRepo = AppDataSource.getRepository(CuadrillaSchema);
    const toolRepo = AppDataSource.getRepository(HerramientasSchema);

    // 1. Obtener la cuadrilla
    const cuadrilla = await cuadrillaRepo.findOneBy({ id: cId });
    if (!cuadrilla) {
        throw new Error('Cuadrilla no encontrada');
    }
    
    // 2. Obtener miembros de la cuadrilla
    const miembros = await getMiembrosByCuadrilla(cId);
    if (miembros.length === 0) {
        throw new Error('No hay miembros asignados a esta cuadrilla.');
    }

    // Separar miembros por roles
    const jefe = miembros.find(m => m.cargo === 'Capataz de Zona' || m.cargo === 'Voluntario Senior');
    const voluntarios = miembros.filter(m => m.cargo === 'Voluntario');

    let assignedCount = 0;

    // Helper para realizar préstamos buscando en la BD la herramienta con stock
    const loanToolByName = async (toolName, userId, notes) => {
        // Verificar si el usuario ya tiene esta herramienta prestada y activa
        const prestamoRepo = AppDataSource.getRepository(PrestamoHerramientaSchema);
        const activeLoans = await prestamoRepo.createQueryBuilder("ph")
            .leftJoinAndSelect("ph.herramienta", "h")
            .where("ph.user_id = :userId", { userId })
            .andWhere("ph.estado_prestamo = 'prestado'")
            .getMany();

        const hasTool = activeLoans.some(p => p.herramienta.nombre.toLowerCase().includes(toolName.toLowerCase()));
        if (hasTool) {
            return null; // Ya tiene asignada una herramienta de este tipo, omitimos
        }

        const tools = await toolRepo.find({
            where: { estado: 'disponible' }
        });
        const matched = tools.find(t => t.nombre.toLowerCase().includes(toolName.toLowerCase()) && t.stock > 0);
        if (!matched) {
            throw new Error(`No hay stock disponible de la herramienta "${toolName}".`);
        }
        return await createPrestamoService(matched.id, userId, notes);
    };

    // Asignar al Jefe: 1 Sierra y 1 Caja de Clavos
    if (jefe) {
        try {
            await loanToolByName('sierra', jefe.user_id, 'Asignación automática: Sierra para el Jefe');
            assignedCount++;
        } catch (e) {
            console.error('Error al asignar Sierra al Jefe:', e.message);
        }
        try {
            await loanToolByName('clavo', jefe.user_id, 'Asignación automática: Caja de Clavos para el Jefe');
            assignedCount++;
        } catch (e) {
            console.error('Error al asignar Caja de Clavos al Jefe:', e.message);
        }
    }

    // Asignar a los Voluntarios: 1 Martillo y 1 Huincha cada uno
    for (const vol of voluntarios) {
        try {
            await loanToolByName('martillo', vol.user_id, 'Asignación automática: Martillo');
            assignedCount++;
        } catch (e) {
            console.error(`Error al asignar Martillo a ${vol.name}:`, e.message);
        }

        try {
            await loanToolByName('huincha', vol.user_id, 'Asignación automática: Huincha');
            assignedCount++;
        } catch (e) {
            console.error(`Error al asignar Huincha a ${vol.name}:`, e.message);
        }
    }

    return {
        assignedCount,
        message: `Se asignaron automáticamente ${assignedCount} herramientas según la distribución de roles (Sierra y Clavos al Jefe; Martillo y Huincha a voluntarios).`
    };
};

const getAvailableTools = async () => {
    const toolRepo = AppDataSource.getRepository(HerramientasSchema);
    const tools = await toolRepo.find({
        where: { estado: 'disponible' },
        order: { nombre: 'ASC' }
    });
    return tools.filter(t => t.stock > 0);
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

function parseRequirementsString(reqStr) {
    if (!reqStr) return [];
    return reqStr.split(',').map(item => {
        const trimmed = item.trim();
        let name = '';
        let qty = 0;
        if (trimmed.includes(':')) {
            const parts = trimmed.split(':');
            name = parts[0].trim();
            qty = parseInt(parts[1].trim(), 10);
        } else {
            const match = trimmed.match(/^(\d+)\s+(.+)$/);
            if (match) {
                qty = parseInt(match[1], 10);
                name = match[2].trim();
            } else {
                return null;
            }
        }
        return { nombre: name, qty: isNaN(qty) ? 0 : qty };
    }).filter(Boolean);
}

const getRecursosFaltantes = async (cuadrillaId) => {
    const cId = parseInt(cuadrillaId, 10);
    const cuadrillaRepo = AppDataSource.getRepository(CuadrillaSchema);
    const asignacionRepo = AppDataSource.getRepository(AsignacionMaterialSchema);
    const prestamoRepo = AppDataSource.getRepository(PrestamoHerramientaSchema);

    // 1. Obtener la cuadrilla
    const cuadrilla = await cuadrillaRepo.findOneBy({ id: cId });
    if (!cuadrilla) {
        throw new Error('Cuadrilla no encontrada');
    }

    // 2. Obtener miembros
    const miembros = await getMiembrosByCuadrilla(cId);

    // Parsear requerimientos de herramientas
    let reqSierra = 1;
    let reqMartillo = 6;
    let reqHuincha = 6;
    let reqClavo = 1;

    if (cuadrilla.herramientas_requeridas) {
        const parsed = parseRequirementsString(cuadrilla.herramientas_requeridas);
        const sierraReq = parsed.find(p => p.nombre.toLowerCase().includes('sierra'));
        const martilloReq = parsed.find(p => p.nombre.toLowerCase().includes('martillo'));
        const huinchaReq = parsed.find(p => p.nombre.toLowerCase().includes('huincha'));
        const clavoReq = parsed.find(p => p.nombre.toLowerCase().includes('clavo') || p.nombre.toLowerCase().includes('caja de clavos'));

        if (sierraReq) reqSierra = sierraReq.qty;
        if (martilloReq) reqMartillo = martilloReq.qty;
        if (huinchaReq) reqHuincha = huinchaReq.qty;
        if (clavoReq) reqClavo = clavoReq.qty;
    }

    // Contar cuántos tienen actualmente prestados
    let asigSierra = 0;
    let asigClavo = 0;
    let asigMartillo = 0;
    let asigHuincha = 0;

    if (miembros.length > 0) {
        const userLoans = await prestamoRepo.createQueryBuilder("ph")
            .leftJoinAndSelect("ph.herramienta", "h")
            .where("ph.user_id IN (:...userIds)", { userIds: miembros.map(m => m.user_id) })
            .andWhere("ph.estado_prestamo = 'prestado'")
            .getMany();

        for (const p of userLoans) {
            const name = p.herramienta.nombre.toLowerCase();
            const member = miembros.find(m => m.user_id === p.user_id);
            if (!member) continue;
            const isJefe = member.cargo === 'Capataz de Zona' || member.cargo === 'Voluntario Senior';

            if (name.includes('sierra') && isJefe) asigSierra++;
            else if (name.includes('clavo') && isJefe) asigClavo++;
            else if (name.includes('martillo') && !isJefe) asigMartillo++;
            else if (name.includes('huincha') && !isJefe) asigHuincha++;
        }
    }

    const missingTools = [
        { nombre: 'Sierra', requerido: reqSierra, asignado: asigSierra, faltante: Math.max(0, reqSierra - asigSierra) },
        { nombre: 'Martillo', requerido: reqMartillo, asignado: asigMartillo, faltante: Math.max(0, reqMartillo - asigMartillo) },
        { nombre: 'Huincha', requerido: reqHuincha, asignado: asigHuincha, faltante: Math.max(0, reqHuincha - asigHuincha) },
        { nombre: 'Caja de Clavos', requerido: reqClavo, asignado: asigClavo, faltante: Math.max(0, reqClavo - asigClavo) }
    ];

    // 3. Calcular materiales asignados y faltantes
    let materialsNeeded = [
        { nombre: 'Plancha de zinc', qty: 12 },
        { nombre: 'Madera de construcción', qty: 24 },
        { nombre: 'Tabla', qty: 40 },
        { nombre: 'Grava', qty: 5 },
        { nombre: 'Arena', qty: 5 }
    ];

    if (cuadrilla.materiales_requeridos) {
        const parsedMats = parseRequirementsString(cuadrilla.materiales_requeridos);
        if (parsedMats.length > 0) {
            materialsNeeded = parsedMats;
        }
    }

    const existingAssignments = await asignacionRepo.find({
        where: { cuadrilla_id: cId },
        relations: ['material']
    });

    const missingMaterials = [];
    for (const item of materialsNeeded) {
        const sumAssigned = existingAssignments
            .filter(a => a.material && a.material.nombre_material.toLowerCase().includes(item.nombre.toLowerCase()))
            .reduce((acc, a) => acc + a.cantidad_asignada, 0);

        missingMaterials.push({
            nombre: item.nombre,
            requerido: item.qty,
            asignado: sumAssigned,
            faltante: Math.max(0, item.qty - sumAssigned)
        });
    }

    return {
        missingTools,
        missingMaterials
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
    autoAssignToolsToCuadrilla,
    getAvailableTools,
    assignToolToUser,
    returnTool,
    getRecursosFaltantes
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
    returnTool,
    getRecursosFaltantes
};

export default cuadrillaService;
