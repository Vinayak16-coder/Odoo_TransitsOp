import { Router } from 'express';
import { TripController } from './trip.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { createTripSchema, assignTripSchema, completeTripSchema, cancelTripSchema } from './trip.schema';

const router = Router();

router.use(authenticate);

// Reads: FLEET_MANAGER, DRIVER
router.get('/', authorize(['FLEET_MANAGER', 'DRIVER']), TripController.getAll);
router.get('/:id', authorize(['FLEET_MANAGER', 'DRIVER']), TripController.getById);

// Writes: DRIVER, FLEET_MANAGER
const writeRoles = ['FLEET_MANAGER', 'DRIVER'];

router.post('/', authorize(writeRoles), validate(createTripSchema), TripController.create);
router.patch('/:id/assign', authorize(writeRoles), validate(assignTripSchema), TripController.assign);
router.patch('/:id/dispatch', authorize(writeRoles), TripController.dispatchTrip);
router.patch('/:id/complete', authorize(writeRoles), validate(completeTripSchema), TripController.completeTrip);
router.patch('/:id/cancel', authorize(writeRoles), validate(cancelTripSchema), TripController.cancelTrip);

export default router;
