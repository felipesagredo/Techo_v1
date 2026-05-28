const express = require('express')

const router = express.Router()

const {
  getAlimentos,
  createAlimento,
  deleteAlimento,
} = require('../controllers/alimentoController')

// Obtener alimentos
router.get('/', getAlimentos)

// Crear alimento
router.post('/', createAlimento)

// Eliminar alimento
router.delete('/:id', deleteAlimento)

module.exports = router