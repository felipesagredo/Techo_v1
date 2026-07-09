const express = require('express')

const router = express.Router()

const jornadaController =
  require('../controllers/jornadaController')

router.get(
  '/',
  jornadaController.getJornadas
)

router.post(
  '/',
  jornadaController.createJornada
)

// Asignar alimento a una jornada
router.post(
  '/:jornadaId/alimentos',
  jornadaController.assignAlimento
)

module.exports = router