import {
    llegadaStockManualService,
    llegadaLoteKitMediasAguasService
} from '../services/inventarioService.js';
import { handleSuccess, handleErrorClient } from '../handlers/responseHandlers.js';

export async function postLlegadaStockManual(req, res) {
    try {
        const { tipo, id, cantidad } = req.body;
        if (!tipo || !id || cantidad === undefined) {
            return handleErrorClient(res, 400, 'Se requieren los campos: tipo (material/herramienta), id y cantidad.');
        }

        const result = await llegadaStockManualService({ tipo, id, cantidad });
        handleSuccess(res, 200, 'Stock actualizado exitosamente.', result);
    } catch (error) {
        console.error('Error al registrar llegada de stock:', error.message);
        handleErrorClient(res, 500, error.message || 'Error al registrar la llegada de stock.', error);
    }
}

export async function postLlegadaLoteKit(req, res) {
    try {
        const result = await llegadaLoteKitMediasAguasService();
        handleSuccess(res, 200, 'Lote de Kit Medias Aguas ingresado exitosamente.', result);
    } catch (error) {
        console.error('Error al cargar lote de Kit Medias Aguas:', error.message);
        handleErrorClient(res, 500, error.message || 'Error al cargar el lote del Kit.', error);
    }
}

export default {
    postLlegadaStockManual,
    postLlegadaLoteKit
};
