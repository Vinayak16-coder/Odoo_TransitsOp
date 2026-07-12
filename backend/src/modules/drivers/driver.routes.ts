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
router.get('/', authorize('Drivers'), DriverController.getAll);
router.get('/:id', authorize('Drivers'), DriverController.getById);

// Writes
router.post('/', authorize('Drivers'), validate(createDriverSchema), DriverController.create);
router.put('/:id', authorize('Drivers'), validate(updateDriverSchema), DriverController.update);
router.patch('/:id/status', authorize('Drivers'), validate(updateDriverStatusSchema), DriverController.updateStatus);
router.delete('/:id', authorize('Drivers'), DriverController.delete);

export default router;
