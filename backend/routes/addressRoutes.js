import express from 'express';
import auth from '../middleware/auth.js';
import addressController from '../controllers/addressController.js';

const router = express.Router();

// Listar direcciones (requiere autenticación)
router.get('/', auth, addressController.getAll);

// Crear nueva dirección (solo admin comprobado en controller)
router.post('/', auth, addressController.create);

// Actualizar dirección (solo admin)
router.put('/:id', auth, addressController.update);

// Eliminar dirección (solo admin)
router.delete('/:id', auth, addressController.delete);

export default router;
