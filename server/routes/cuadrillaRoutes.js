const express = require('express');
const router = express.Router();
const cuadrillaController = require('../controllers/cuadrillaController');

router.post('/', cuadrillaController.create);
router.post('/add-member', cuadrillaController.addMember);
router.get('/:id/miembros', cuadrillaController.getDetails);

module.exports = router;