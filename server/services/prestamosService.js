import AppDataSource from '../config/db.js';
import PrestamoHerramientaSchema from '../entity/PrestamoHerramienta.entity.js';
import HerramientasSchema from '../entity/Herramientas.entity.js';

export async function createPrestamoService(herramientaId, userId, notas = '') {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const hId = parseInt(herramientaId, 10);
        const uId = parseInt(userId, 10);

        const herramientasRepository = queryRunner.manager.getRepository(HerramientasSchema);
        const prestamosRepository = queryRunner.manager.getRepository(PrestamoHerramientaSchema);

        // 1. Verificar si la herramienta existe y está disponible
        const herramienta = await herramientasRepository.findOneBy({ id: hId });
        if (!herramienta) {
            throw new Error('La herramienta no existe.');
        }

        if (herramienta.assigned_to) {
            throw new Error('La herramienta ya está prestada a otro voluntario.');
        }

        // 2. Registrar el préstamo en la bitácora
        const newPrestamo = prestamosRepository.create({
            herramienta_id: hId,
            user_id: uId,
            estado_prestamo: 'prestado',
            notas
        });
        const savedPrestamo = await prestamosRepository.save(newPrestamo);

        // 3. Actualizar el estado de la herramienta
        herramienta.assigned_to = uId;
        herramienta.estado = 'no-disponible';
        herramienta.updated_at = new Date();
        await herramientasRepository.save(herramienta);

        await queryRunner.commitTransaction();
        return savedPrestamo;
    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
}

export async function registrarDevolucionService(prestamoId, notas = '') {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const pId = parseInt(prestamoId, 10);
        const prestamosRepository = queryRunner.manager.getRepository(PrestamoHerramientaSchema);
        const herramientasRepository = queryRunner.manager.getRepository(HerramientasSchema);

        // 1. Obtener detalles del préstamo activo
        const prestamo = await prestamosRepository.findOneBy({ id: pId, estado_prestamo: 'prestado' });
        if (!prestamo) {
            throw new Error('Préstamo no encontrado o ya devuelto.');
        }

        // 2. Actualizar el registro del préstamo a devuelto
        prestamo.fecha_devolucion = new Date();
        prestamo.estado_prestamo = 'devuelto';
        if (notas && notas.trim() !== '') {
            prestamo.notas = notas;
        }
        const savedPrestamo = await prestamosRepository.save(prestamo);

        // 3. Actualizar la herramienta para que vuelva a estar disponible y sin asignación
        const herramienta = await herramientasRepository.findOneBy({ id: prestamo.herramienta_id });
        if (herramienta) {
            herramienta.assigned_to = null;
            herramienta.estado = 'disponible';
            herramienta.updated_at = new Date();
            await herramientasRepository.save(herramienta);
        }

        await queryRunner.commitTransaction();
        return savedPrestamo;
    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
}

export async function getHistorialByHerramientaService(herramientaId) {
    const prestamoRepository = AppDataSource.getRepository(PrestamoHerramientaSchema);
    const rows = await prestamoRepository.createQueryBuilder("ph")
        .leftJoin("users", "u", "ph.user_id = u.id")
        .select([
            "ph.id AS id",
            "ph.herramienta_id AS herramienta_id",
            "ph.user_id AS user_id",
            "u.name AS voluntario_nombre",
            "u.email AS voluntario_email",
            "ph.fecha_prestamo AS fecha_prestamo",
            "ph.fecha_devolucion AS fecha_devolucion",
            "ph.estado_prestamo AS estado_prestamo",
            "ph.notas AS notas"
        ])
        .where("ph.herramienta_id = :herramientaId", { herramientaId: parseInt(herramientaId, 10) })
        .orderBy("ph.fecha_prestamo", "DESC")
        .getRawMany();

    return rows;
}

export default {
    createPrestamoService,
    registrarDevolucionService,
    getHistorialByHerramientaService
};
