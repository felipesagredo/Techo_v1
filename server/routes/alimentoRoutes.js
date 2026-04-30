const express = require('express');
const router = express.Router();

const alimentoController = require('../controllers/alimentoController');

router.get('/', alimentoController.getAllAlimentos);

router.get('/:id', alimentoController.getAlimentoById);

router.post('/', alimentoController.createAlimento);

router.put('/:id', alimentoController.updateAlimento);

router.delete('/:id', alimentoController.deleteAlimento);

module.exports = router;