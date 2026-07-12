import { Router } from 'express';
import { MaintenanceController } from './maintenance.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { createMaintenanceSchema, updateMaintenanceSchema } from './maintenance.schema';

const router = Router();

router.use(authenticate);

router.get('/', authorize('Maintenance'), MaintenanceController.getAll);

// Writes
router.post('/', authorize('Maintenance'), validate(createMaintenanceSchema), MaintenanceController.create);
router.patch('/:id/complete', authorize('Maintenance'), MaintenanceController.complete);
router.put('/:id', authorize('Maintenance'), validate(updateMaintenanceSchema), MaintenanceController.update);
router.delete('/:id', authorize('Maintenance'), MaintenanceController.delete);

export default router;
