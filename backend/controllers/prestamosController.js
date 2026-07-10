import {
    createPrestamoService,
    registrarDevolucionService,
    getHistorialByHerramientaService
} from '../services/prestamosService.js';
import { handleSuccess, handleErrorClient } from '../handlers/responseHandlers.js';

export async function createPrestamo(req, res) {
    try {
        const { herramientaId, userId, notas } = req.body;
        if (!herramientaId || !userId) {
            return handleErrorClient(res, 400, 'Se requieren los campos herramientaId y userId.');
        }

        const prestamo = await createPrestamoService(Number(herramientaId), Number(userId), notas);
        handleSuccess(res, 201, 'Préstamo registrado exitosamente', prestamo);
    } catch (error) {
        console.error('Error al prestar herramienta:', error.message);
        handleErrorClient(res, 500, error.message || 'Error al registrar el préstamo.', error);
    }
}

export async function registrarDevolucion(req, res) {
    try {
        const { id } = req.params; // ID del préstamo
        const { notas } = req.body;

        const devolucion = await registrarDevolucionService(Number(id), notas);
        handleSuccess(res, 200, 'Devolución registrada exitosamente', devolucion);
    } catch (error) {
        console.error('Error al devolver herramienta:', error.message);
        handleErrorClient(res, 500, error.message || 'Error al registrar la devolución.', error);
    }
}

export async function getHistorialByHerramienta(req, res) {
    try {
        const { id } = req.params; // ID de la herramienta
        const historial = await getHistorialByHerramientaService(Number(id));
        handleSuccess(res, 200, 'Historial obtenido exitosamente', historial);
    } catch (error) {
        console.error('Error al obtener historial:', error.message);
        handleErrorClient(res, 500, 'Error al obtener el historial.', error);
    }
}

export default {
    createPrestamo,
    registrarDevolucion,
    getHistorialByHerramienta
};
