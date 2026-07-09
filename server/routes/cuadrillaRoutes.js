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
router.get('/available-tools', cuadrillaController.getAvailableTools);
router.post('/assign-tool', cuadrillaController.assignTool);
router.post('/return-tool', cuadrillaController.returnTool);

router.get('/:id/miembros', cuadrillaController.getDetails);
router.get('/:id/recursos-faltantes', cuadrillaController.recursosFaltantes);
router.post('/:id/auto-assign-tools', cuadrillaController.autoAssignTools);
router.post('/:id/rellenar-materiales', cuadrillaController.rellenarMateriales);
router.put('/:id', cuadrillaController.update);
router.delete('/:id', cuadrillaController.remove);

export default router;