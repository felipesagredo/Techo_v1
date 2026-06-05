const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Definir rutas estáticas antes de las dinámicas
router.get('/available', userController.getAvailable);
router.get('/roles', userController.getRoles);
router.get('/', userController.getAll);

// Rutas dinámicas (con :id) al final
router.get('/:id', userController.getById);
router.delete('/:id', userController.remove);
router.put('/:id', userController.update);

module.exports = router;
