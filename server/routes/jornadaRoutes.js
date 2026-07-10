import express from 'express';
import * as jornadaController from '../controllers/jornadaController.js';

const router = express.Router();

router.get('/', jornadaController.getJornadas);

router.get('/activas', jornadaController.getJornadasActivas);

router.post('/', jornadaController.createJornada);

// Asignar alimento a una jornada
router.post('/:jornadaId/alimentos', jornadaController.assignAlimento);

export default router;