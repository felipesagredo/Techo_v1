import express from 'express';
import * as alimentoController from '../controllers/alimentoController.js';
import verifyToken from '../middleware/auth.js';
import authorizeRoles from '../middleware/authorization.middleware.js';

const router = express.Router();

// TODOS los autenticados pueden visualizar
router.get('/', verifyToken, alimentoController.getAlimentos);

// SOLO admin puede crear, eliminar, editar
router.post('/', verifyToken, authorizeRoles('admin'), alimentoController.createAlimento);
router.delete('/:id', verifyToken, authorizeRoles('admin'), alimentoController.deleteAlimento);
router.put('/:id', verifyToken, authorizeRoles('admin'), alimentoController.updateAlimento);

export default router;