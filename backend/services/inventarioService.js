import AppDataSource from '../config/db.js';
import MaterialesSchema from '../entity/Materiales.entity.js';
import HerramientasSchema from '../entity/Herramientas.entity.js';

export async function llegadaStockManualService({ tipo, id, cantidad }) {
    const qty = parseInt(cantidad, 10);
    if (isNaN(qty) || qty <= 0) {
        throw new Error('La cantidad debe ser un número positivo.');
    }

    if (tipo === 'material') {
        const repo = AppDataSource.getRepository(MaterialesSchema);
        const material = await repo.findOneBy({ id: parseInt(id, 10) });
        if (!material) {
            throw new Error('El material seleccionado no existe.');
        }
        material.cantidad += qty;
        material.estado = 'disponible';
        material.updated_at = new Date();
        return await repo.save(material);
    } else if (tipo === 'herramienta') {
        const repo = AppDataSource.getRepository(HerramientasSchema);
        const herramienta = await repo.findOneBy({ id: parseInt(id, 10) });
        if (!herramienta) {
            throw new Error('La herramienta seleccionada no existe.');
        }
        herramienta.stock += qty;
        herramienta.estado = 'disponible';
        herramienta.updated_at = new Date();
        return await repo.save(herramienta);
    } else {
        throw new Error('Tipo de inventario no válido.');
    }
}

export async function llegadaLoteKitMediasAguasService() {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        const materialRepo = queryRunner.manager.getRepository(MaterialesSchema);
        const herramientaRepo = queryRunner.manager.getRepository(HerramientasSchema);

        // 1. Abastecer Herramientas (Sierra, Martillo, Huincha, Caja de Clavos)
        const toolsToSeed = [
            { nombre: 'Sierra', descripcion: 'Sierra de mano para madera', qty: 10, categoria: 'manual' },
            { nombre: 'Martillo', descripcion: 'Martillo manual de carpintero', qty: 50, categoria: 'manual' },
            { nombre: 'Huincha', descripcion: 'Huincha de medir 5m', qty: 50, categoria: 'manual' },
            { nombre: 'Caja de Clavos', descripcion: 'Caja de clavos de construcción', qty: 20, categoria: 'manual' }
        ];

        for (const t of toolsToSeed) {
            // Buscamos herramienta con el mismo nombre y que esté disponible/libre
            let tool = await herramientaRepo.findOne({
                where: { nombre: t.nombre }
            });

            if (tool) {
                tool.stock += t.qty;
                tool.estado = 'disponible';
                tool.updated_at = new Date();
                await herramientaRepo.save(tool);
            } else {
                tool = herramientaRepo.create({
                    nombre: t.nombre,
                    descripcion: t.descripcion,
                    stock: t.qty,
                    categoria_herramienta: t.categoria,
                    estado: 'disponible'
                });
                await herramientaRepo.save(tool);
            }
        }

        // 2. Abastecer Materiales (Plancha de zinc, Madera de construcción, Tabla, Grava, Arena)
        const materialsToSeed = [
            { nombre: 'Plancha de zinc', qty: 100, categoria: 'construccion', largo: 2.5, ancho: 0.8, peso: 5.0 },
            { nombre: 'Madera de construcción', qty: 200, categoria: 'construccion', largo: 3.2, ancho: 0.1, peso: 8.0 },
            { nombre: 'Tabla', qty: 200, categoria: 'construccion', largo: 3.0, ancho: 0.15, peso: 4.0 },
            { nombre: 'Grava', qty: 50, categoria: 'construccion', peso: 25.0 },
            { nombre: 'Arena', qty: 50, categoria: 'construccion', peso: 25.0 }
        ];

        for (const m of materialsToSeed) {
            let material = await materialRepo.findOne({
                where: { nombre_material: m.nombre }
            });

            if (material) {
                material.cantidad += m.qty;
                material.estado = 'disponible';
                material.updated_at = new Date();
                await materialRepo.save(material);
            } else {
                material = materialRepo.create({
                    nombre_material: m.nombre,
                    cantidad: m.qty,
                    categoria: m.categoria,
                    largo: m.largo || null,
                    ancho: m.ancho || null,
                    peso: m.peso || 0,
                    estado: 'disponible'
                });
                await materialRepo.save(material);
            }
        }

        await queryRunner.commitTransaction();
        return { message: 'Lote de Kit Medias Aguas ingresado correctamente.' };
    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
}

export default {
    llegadaStockManualService,
    llegadaLoteKitMediasAguasService
};
