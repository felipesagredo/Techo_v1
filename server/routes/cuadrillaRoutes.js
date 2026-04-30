import express from 'express';
import cuadrillaController from '../controllers/cuadrillaController.js';

const router = express.Router();

router.get('/', cuadrillaController.getAll);
router.get('/roles', cuadrillaController.getRoles);
router.post('/', cuadrillaController.create);
router.post('/add-member', cuadrillaController.addMember);
router.get('/:id/miembros', cuadrillaController.getDetails);

export default router;