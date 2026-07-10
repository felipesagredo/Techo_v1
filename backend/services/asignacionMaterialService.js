import AppDataSource from '../config/db.js';
import AsignacionMaterialSchema from '../entity/AsignacionMaterial.entity.js';
import MaterialesSchema from '../entity/Materiales.entity.js';
import CuadrillaSchema from '../entity/Cuadrilla.entity.js';

export async function createAsignacionMaterialService(materialId, cuadrillaId, cantidad, notas = '') {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const mId = parseInt(materialId, 10);
        const cId = parseInt(cuadrillaId, 10);
        const cant = parseInt(cantidad, 10);

        if (isNaN(cant) || cant <= 0) {
            throw new Error('La cantidad a asignar debe ser mayor a 0.');
        }

        const materialesRepository = queryRunner.manager.getRepository(MaterialesSchema);
        const cuadrillasRepository = queryRunner.manager.getRepository(CuadrillaSchema);
        const asignacionRepository = queryRunner.manager.getRepository(AsignacionMaterialSchema);

        // 1. Verificar si el material existe
        const material = await materialesRepository.findOneBy({ id: mId });
        if (!material) {
            throw new Error('El material no existe.');
        }

        // 2. Verificar si la cuadrilla existe
        const cuadrilla = await cuadrillasRepository.findOneBy({ id: cId });
        if (!cuadrilla) {
            throw new Error('La cuadrilla no existe.');
        }

        // 3. Verificar si hay stock suficiente
        if (material.cantidad < cant) {
            throw new Error(`Stock insuficiente. Solo hay ${material.cantidad} unidades disponibles.`);
        }

        // 4. Registrar la asignación
        const nuevaAsignacion = asignacionRepository.create({
            material_id: mId,
            cuadrilla_id: cId,
            cantidad_asignada: cant,
            notas: notas
        });
        const savedAsignacion = await asignacionRepository.save(nuevaAsignacion);

        // 5. Descontar la cantidad del stock del material
        material.cantidad -= cant;
        if (material.cantidad === 0) {
            material.estado = 'no-disponible';
        }
        material.updated_at = new Date();
        await materialesRepository.save(material);

        await queryRunner.commitTransaction();
        return savedAsignacion;
    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
}

export async function getHistorialByMaterialService(materialId) {
    const asignacionRepository = AppDataSource.getRepository(AsignacionMaterialSchema);
    const rows = await asignacionRepository.createQueryBuilder("am")
        .leftJoin("cuadrillas", "c", "am.cuadrilla_id = c.id")
        .select([
            "am.id AS id",
            "am.material_id AS material_id",
            "am.cuadrilla_id AS cuadrilla_id",
            "c.nombre AS cuadrilla_nombre",
            "c.zona AS cuadrilla_zona",
            "am.cantidad_asignada AS cantidad_asignada",
            "am.fecha_asignacion AS fecha_asignacion",
            "am.notas AS notas"
        ])
        .where("am.material_id = :materialId", { materialId: parseInt(materialId, 10) })
        .orderBy("am.fecha_asignacion", "DESC")
        .getRawMany();

    return rows;
}

function parseRequirementsString(reqStr) {
    if (!reqStr) return [];
    return reqStr.split(',').map(item => {
        const parts = item.split(':');
        if (parts.length < 2) return null;
        return {
            nombre: parts[0].trim(),
            qty: parseInt(parts[1].trim(), 10)
        };
    }).filter(Boolean);
}

export async function autoAssignMaterialsToCuadrillaService(cuadrillaId) {
    const materialRepo = AppDataSource.getRepository(MaterialesSchema);
    const asignacionRepo = AppDataSource.getRepository(AsignacionMaterialSchema);
    const cuadrillaRepo = AppDataSource.getRepository(CuadrillaSchema);

    // Obtener cuadrilla para cargar requerimientos dinámicos
    const cuadrilla = await cuadrillaRepo.findOneBy({ id: parseInt(cuadrillaId, 10) });

    let materialsNeeded = [
        { nombre: 'Plancha de zinc', qty: 12 },
        { nombre: 'Madera de construcción', qty: 24 },
        { nombre: 'Tabla', qty: 40 },
        { nombre: 'Grava', qty: 5 },
        { nombre: 'Arena', qty: 5 }
    ];

    if (cuadrilla && cuadrilla.materiales_requeridos) {
        const customNeeded = parseRequirementsString(cuadrilla.materiales_requeridos);
        if (customNeeded.length > 0) {
            materialsNeeded = customNeeded;
        }
    }

    // Obtener asignaciones existentes para esta cuadrilla
    const existingAssignments = await asignacionRepo.find({
        where: { cuadrilla_id: parseInt(cuadrillaId, 10) },
        relations: ['material']
    });

    for (const item of materialsNeeded) {
        // Calcular cuánto se ha asignado ya
        const sumAssigned = existingAssignments
            .filter(a => a.material && a.material.nombre_material.toLowerCase().includes(item.nombre.toLowerCase()))
            .reduce((acc, a) => acc + a.cantidad_asignada, 0);

        const needed = item.qty - sumAssigned;
        if (needed <= 0) continue; // Ya tiene la cantidad requerida o más

        const material = await materialRepo.findOne({
            where: { nombre_material: item.nombre }
        });
        if (!material) {
            throw new Error(`El material "${item.nombre}" no existe en el inventario.`);
        }
        if (material.cantidad < needed) {
            throw new Error(`Stock insuficiente de "${item.nombre}". Se requieren ${needed} unidades más, pero solo hay ${material.cantidad}.`);
        }

        // Registrar la asignación
        const nuevaAsignacion = asignacionRepo.create({
            material_id: material.id,
            cuadrilla_id: parseInt(cuadrillaId, 10),
            cantidad_asignada: needed,
            notas: `Relleno automático de kit estándar (se agregaron ${needed} unidades)`
        });
        await asignacionRepo.save(nuevaAsignacion);

        // Descontar la cantidad
        material.cantidad -= needed;
        if (material.cantidad === 0) {
            material.estado = 'no-disponible';
        }
        material.updated_at = new Date();
        await materialRepo.save(material);
    }
}

export default {
    createAsignacionMaterialService,
    getHistorialByMaterialService,
    autoAssignMaterialsToCuadrillaService
};
