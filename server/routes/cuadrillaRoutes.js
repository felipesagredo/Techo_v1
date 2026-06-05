const express = require('express');
const router = express.Router();
const cuadrillaController = require('../controllers/cuadrillaController');

router.get('/', cuadrillaController.getAll);
router.get('/roles', cuadrillaController.getRoles);
router.get('/available-count', cuadrillaController.getAvailableCount);
router.post('/', cuadrillaController.create);
router.post('/auto-generate', cuadrillaController.autoGenerate);
router.post('/add-member', cuadrillaController.addMember);
router.post('/remove-member', cuadrillaController.removeMember);
router.get('/:id/miembros', cuadrillaController.getDetails);
router.put('/:id', cuadrillaController.update);
router.delete('/:id', cuadrillaController.remove);

module.exports = router;