import { Router } from 'express';
import { VehicleController } from './vehicle.controller';
import { validate } from '../../middleware/validate';
import { createVehicleSchema, updateVehicleSchema, updateVehicleStatusSchema } from './vehicle.schema';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

// Protect all routes
router.use(authenticate);

router.get('/', authorize('Fleet'), VehicleController.getAll);
router.get('/:id', authorize('Fleet'), VehicleController.getById);

// Writes
router.post('/', authorize('Fleet'), validate(createVehicleSchema), VehicleController.create);
router.put('/:id', authorize('Fleet'), validate(updateVehicleSchema), VehicleController.update);
router.patch('/:id/status', authorize('Fleet'), validate(updateVehicleStatusSchema), VehicleController.updateStatus);
router.delete('/:id', authorize('Fleet'), VehicleController.delete);

export default router;
