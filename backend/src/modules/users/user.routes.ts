import { Router } from 'express';
import { UserController } from './user.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { createUserSchema, updateUserSchema } from './user.schema';

const router = Router();

router.use(authenticate);

router.get('/', authorize('Settings'), UserController.getAll);
router.post('/', authorize('Settings'), validate(createUserSchema), UserController.create);
router.put('/:id', authorize('Settings'), validate(updateUserSchema), UserController.update);
router.delete('/:id', authorize('Settings'), UserController.delete);

router.get('/permissions-matrix', authorize('Settings'), UserController.getPermissionsMatrix);

export default router;
