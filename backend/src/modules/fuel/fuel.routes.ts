import { Router } from 'express';
import { FuelController } from './fuel.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { createFuelSchema, updateFuelSchema } from './fuel.schema';

const router = Router();

router.use(authenticate);

router.get('/', authorize('FuelAndExpenses'), FuelController.getAll);

// Writes
router.post('/', authorize('FuelAndExpenses'), validate(createFuelSchema), FuelController.create);
router.put('/:id', authorize('FuelAndExpenses'), validate(updateFuelSchema), FuelController.update);
router.delete('/:id', authorize('FuelAndExpenses'), FuelController.delete);

export default router;
