import { Router } from 'express';
import { MaintenanceController } from './maintenance.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { createMaintenanceSchema, updateMaintenanceSchema } from './maintenance.schema';

const router = Router();

router.use(authenticate);

// Reads: FLEET_MANAGER, SAFETY_OFFICER
router.get('/', authorize(['FLEET_MANAGER', 'SAFETY_OFFICER']), MaintenanceController.getAll);

// Writes: FLEET_MANAGER, SAFETY_OFFICER
const writeRoles = ['FLEET_MANAGER', 'SAFETY_OFFICER'];

router.post('/', authorize(writeRoles), validate(createMaintenanceSchema), MaintenanceController.create);
router.patch('/:id/complete', authorize(writeRoles), MaintenanceController.complete);
router.put('/:id', authorize(writeRoles), validate(updateMaintenanceSchema), MaintenanceController.update);
router.delete('/:id', authorize(['FLEET_MANAGER']), MaintenanceController.delete);

export default router;
