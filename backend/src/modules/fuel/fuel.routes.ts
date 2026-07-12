import { Router } from 'express';
import { FuelController } from './fuel.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { createFuelSchema, updateFuelSchema } from './fuel.schema';

const router = Router();

router.use(authenticate);

// Reads: FLEET_MANAGER, FINANCIAL_ANALYST
router.get('/', authorize(['FLEET_MANAGER', 'FINANCIAL_ANALYST']), FuelController.getAll);

// Writes: FLEET_MANAGER, FINANCIAL_ANALYST
const writeRoles = ['FLEET_MANAGER', 'FINANCIAL_ANALYST'];

router.post('/', authorize(writeRoles), validate(createFuelSchema), FuelController.create);
router.put('/:id', authorize(writeRoles), validate(updateFuelSchema), FuelController.update);
router.delete('/:id', authorize(['FINANCIAL_ANALYST']), FuelController.delete);

export default router;
