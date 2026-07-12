import { Router } from 'express';
import { ExpenseController } from './expense.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { createExpenseSchema, updateExpenseSchema } from './expense.schema';

const router = Router();

router.use(authenticate);

// Reads: FLEET_MANAGER, FINANCIAL_ANALYST
router.get('/', authorize(['FLEET_MANAGER', 'FINANCIAL_ANALYST']), ExpenseController.getAll);

// Writes: FLEET_MANAGER, FINANCIAL_ANALYST
const writeRoles = ['FLEET_MANAGER', 'FINANCIAL_ANALYST'];

router.post('/', authorize(writeRoles), validate(createExpenseSchema), ExpenseController.create);
router.put('/:id', authorize(writeRoles), validate(updateExpenseSchema), ExpenseController.update);
router.delete('/:id', authorize(['FINANCIAL_ANALYST']), ExpenseController.delete);

export default router;
