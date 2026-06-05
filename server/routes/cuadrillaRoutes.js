import express from 'express';
import cuadrillaController from '../controllers/cuadrillaController.js';

const router = express.Router();

router.get('/', cuadrillaController.getAll);
router.get('/roles', cuadrillaController.getRoles);
router.post('/', cuadrillaController.create);
router.post('/add-member', cuadrillaController.addMember);
router.post('/remove-member', cuadrillaController.removeMember);
router.get('/:id/miembros', cuadrillaController.getDetails);
router.put('/:id', cuadrillaController.update);
router.delete('/:id', cuadrillaController.remove);

export default router;