import pool from '../config/db.js';

export async function createPrestamoService(herramientaId, userId, notas = '') {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Verificar si la herramienta existe y está disponible
        const herrCheck = await client.query('SELECT estado, assigned_to FROM herramientas WHERE id = $1', [herramientaId]);
        if (herrCheck.rows.length === 0) {
            throw new Error('La herramienta no existe.');
        }

        const herramienta = herrCheck.rows[0];
        if (herramienta.assigned_to) {
            throw new Error('La herramienta ya está prestada a otro voluntario.');
        }

        // 2. Registrar el préstamo en la bitácora
        const prestamoQuery = `
            INSERT INTO prestamos_herramientas (herramienta_id, user_id, estado_prestamo, notas)
            VALUES ($1, $2, 'prestado', $3)
            RETURNING *
        `;
        const prestamoResult = await client.query(prestamoQuery, [herramientaId, userId, notas]);

        // 3. Actualizar el estado de la herramienta
        await client.query(
            "UPDATE herramientas SET assigned_to = $1, estado = 'no-disponible', updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            [userId, herramientaId]
        );

        await client.query('COMMIT');
        return prestamoResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function registrarDevolucionService(prestamoId, notas = '') {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Obtener detalles del préstamo activo
        const prestamoCheck = await client.query(
            "SELECT herramienta_id, user_id FROM prestamos_herramientas WHERE id = $1 AND estado_prestamo = 'prestado'",
            [prestamoId]
        );

        if (prestamoCheck.rows.length === 0) {
            throw new Error('Préstamo no encontrado o ya devuelto.');
        }

        const { herramienta_id } = prestamoCheck.rows[0];

        // 2. Actualizar el registro del préstamo a devuelto
        const updatePrestamo = `
            UPDATE prestamos_herramientas 
            SET fecha_devolucion = CURRENT_TIMESTAMP, estado_prestamo = 'devuelto', notas = COALESCE(NULLIF($1, ''), notas)
            WHERE id = $2
            RETURNING *
        `;
        const prestamoResult = await client.query(updatePrestamo, [notas, prestamoId]);

        // 3. Actualizar la herramienta para que vuelva a estar disponible y sin asignación
        await client.query(
            "UPDATE herramientas SET assigned_to = NULL, estado = 'disponible', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
            [herramienta_id]
        );

        await client.query('COMMIT');
        return prestamoResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function getHistorialByHerramientaService(herramientaId) {
    const query = `
        SELECT 
            ph.id,
            ph.herramienta_id,
            ph.user_id,
            u.name AS voluntario_nombre,
            u.email AS voluntario_email,
            ph.fecha_prestamo,
            ph.fecha_devolucion,
            ph.estado_prestamo,
            ph.notas
        FROM prestamos_herramientas ph
        LEFT JOIN users u ON ph.user_id = u.id
        WHERE ph.herramienta_id = $1
        ORDER BY ph.fecha_prestamo DESC
    `;
    const result = await pool.query(query, [herramientaId]);
    return result.rows;
}

export default {
    createPrestamoService,
    registrarDevolucionService,
    getHistorialByHerramientaService
};
