import { Router } from 'express';
import { DriverController } from './driver.controller';
import { validate } from '../../middleware/validate';
import { createDriverSchema, updateDriverSchema, updateDriverStatusSchema } from './driver.schema';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// Protect all routes
router.use(authenticate);

// Reads: FLEET_MANAGER, SAFETY_OFFICER, DRIVER
router.get('/', authorize(['FLEET_MANAGER', 'SAFETY_OFFICER', 'DRIVER']), DriverController.getAll);
router.get('/:id', authorize(['FLEET_MANAGER', 'SAFETY_OFFICER', 'DRIVER']), DriverController.getById);

// Writes: FLEET_MANAGER, SAFETY_OFFICER
router.post('/', authorize(['FLEET_MANAGER', 'SAFETY_OFFICER']), validate(createDriverSchema), DriverController.create);
router.put('/:id', authorize(['FLEET_MANAGER', 'SAFETY_OFFICER']), validate(updateDriverSchema), DriverController.update);
router.patch('/:id/status', authorize(['FLEET_MANAGER', 'SAFETY_OFFICER']), validate(updateDriverStatusSchema), DriverController.updateStatus);
router.delete('/:id', authorize(['FLEET_MANAGER', 'SAFETY_OFFICER']), DriverController.delete);

export default router;
