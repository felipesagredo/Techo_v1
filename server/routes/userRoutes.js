import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();

// Definir rutas estáticas antes de las dinámicas
router.get('/available', userController.getAvailable);
router.get('/roles', userController.getRoles);
router.get('/', userController.getAll);

// Rutas dinámicas (con :id) al final
router.get('/:id', userController.getById);
router.delete('/:id', userController.remove);
router.put('/:id', userController.update);

export default router;
