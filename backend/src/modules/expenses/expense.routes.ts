import { Router } from 'express';
import { ExpenseController } from './expense.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { createExpenseSchema, updateExpenseSchema } from './expense.schema';

const router = Router();

router.use(authenticate);

router.get('/', authorize('FuelAndExpenses'), ExpenseController.getAll);

// Writes
router.post('/', authorize('FuelAndExpenses'), validate(createExpenseSchema), ExpenseController.create);
router.put('/:id', authorize('FuelAndExpenses'), validate(updateExpenseSchema), ExpenseController.update);
router.delete('/:id', authorize('FuelAndExpenses'), ExpenseController.delete);

export default router;
