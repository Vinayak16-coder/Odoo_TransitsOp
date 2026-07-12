import { Router } from 'express';
import { TripController } from './trip.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { createTripSchema, assignTripSchema, completeTripSchema, cancelTripSchema } from './trip.schema';

const router = Router();

router.use(authenticate);

// Reads: FLEET_MANAGER, DRIVER
router.get('/', authorize('Trips'), TripController.getAll);
router.get('/:id', authorize('Trips'), TripController.getById);

// Writes
router.post('/', authorize('Trips'), validate(createTripSchema), TripController.create);
router.patch('/:id/assign', authorize('Trips'), validate(assignTripSchema), TripController.assign);
router.patch('/:id/dispatch', authorize('Trips'), TripController.dispatchTrip);
router.patch('/:id/complete', authorize('Trips'), validate(completeTripSchema), TripController.completeTrip);
router.patch('/:id/cancel', authorize('Trips'), validate(cancelTripSchema), TripController.cancelTrip);

export default router;
