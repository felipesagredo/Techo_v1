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

module.exports = router