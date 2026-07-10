import {
    createAsignacionMaterialService,
    getHistorialByMaterialService
} from '../services/asignacionMaterialService.js';
import { handleSuccess, handleErrorClient } from '../handlers/responseHandlers.js';

export async function createAsignacion(req, res) {
    try {
        const { materialId, cuadrillaId, cantidad, notas } = req.body;
        
        if (!materialId || !cuadrillaId || cantidad === undefined) {
            return handleErrorClient(res, 400, 'Se requieren los campos materialId, cuadrillaId y cantidad.');
        }

        const asignacion = await createAsignacionMaterialService(Number(materialId), Number(cuadrillaId), Number(cantidad), notas);
        handleSuccess(res, 201, 'Material asignado exitosamente', asignacion);
    } catch (error) {
        console.error('Error al asignar material:', error.message);
        handleErrorClient(res, 500, error.message || 'Error al registrar la asignación.', error);
    }
}

export async function getHistorialByMaterial(req, res) {
    try {
        const { id } = req.params; // ID del material
        const historial = await getHistorialByMaterialService(Number(id));
        handleSuccess(res, 200, 'Historial obtenido exitosamente', historial);
    } catch (error) {
        console.error('Error al obtener historial:', error.message);
        handleErrorClient(res, 500, 'Error al obtener el historial.', error);
    }
}

export default {
    createAsignacion,
    getHistorialByMaterial
};
