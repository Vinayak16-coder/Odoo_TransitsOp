import { Router } from 'express';
import { VehicleController } from './vehicle.controller';
import { validate } from '../../middleware/validate';
import { createVehicleSchema, updateVehicleSchema, updateVehicleStatusSchema } from './vehicle.schema';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// Protect all routes
router.use(authenticate);

// Reads: FLEET_MANAGER, DRIVER
router.get('/', authorize(['FLEET_MANAGER', 'DRIVER']), VehicleController.getAll);
router.get('/:id', authorize(['FLEET_MANAGER', 'DRIVER']), VehicleController.getById);

// Writes: FLEET_MANAGER only
router.post('/', authorize(['FLEET_MANAGER']), validate(createVehicleSchema), VehicleController.create);
router.put('/:id', authorize(['FLEET_MANAGER']), validate(updateVehicleSchema), VehicleController.update);
router.patch('/:id/status', authorize(['FLEET_MANAGER']), validate(updateVehicleStatusSchema), VehicleController.updateStatus);
router.delete('/:id', authorize(['FLEET_MANAGER']), VehicleController.delete);

export default router;
