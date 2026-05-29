const express = require('express');
const router = express.Router();

const alimentoController = require('../controllers/alimentoController');

const verifyToken = require('../middleware/authMiddleware');
const verifyRole = require('../middleware/roleMiddleware');

// TODOS pueden visualizar
router.get(
  '/',
  verifyToken,
  alimentoController.getAlimentos
);

// SOLO admin puede crear
router.post(
  '/',
  verifyToken,
  verifyRole(['admin']),
  alimentoController.createAlimento
);

// SOLO admin puede eliminar
router.delete(
  '/:id',
  verifyToken,
  verifyRole(['admin']),
  alimentoController.deleteAlimento
);

// SOLO admin puede editar
router.put(
  '/:id',
  verifyToken,
  verifyRole(['admin']),
  alimentoController.updateAlimento
)

module.exports = router;