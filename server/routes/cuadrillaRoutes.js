import express from 'express';
import cuadrillaController from '../controllers/cuadrillaController.js';

const router = express.Router();

router.get('/', cuadrillaController.getAll);
router.get('/roles', cuadrillaController.getRoles);
router.post('/', cuadrillaController.create);
router.post('/add-member', cuadrillaController.addMember);
router.post('/remove-member', cuadrillaController.removeMember);
router.get('/available-count', cuadrillaController.getAvailableCount);
router.post('/auto-generate', cuadrillaController.autoGenerate);
router.get('/:id/miembros', cuadrillaController.getDetails);
router.post('/:id/auto-assign-tools', cuadrillaController.autoAssignTools);
router.put('/:id', cuadrillaController.update);
router.delete('/:id', cuadrillaController.remove);

export default router;