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

export default {
    createAsignacionMaterialService,
    getHistorialByMaterialService
};
