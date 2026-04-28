const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const addressController = require('../controllers/addressController');

// Listar direcciones (requiere autenticación)
router.get('/', auth, addressController.getAll);

// Crear nueva dirección (solo admin comprobado en controller)
router.post('/', auth, addressController.create);

// Actualizar dirección (solo admin)
router.put('/:id', auth, addressController.update);

// Eliminar dirección (solo admin)
router.delete('/:id', auth, addressController.delete);

module.exports = router;
