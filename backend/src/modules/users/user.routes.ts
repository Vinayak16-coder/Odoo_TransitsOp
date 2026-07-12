import { Router } from 'express';
import { UserController } from './user.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { createUserSchema, updateUserSchema } from './user.schema';

const router = Router();

router.use(authenticate);

// Settings is accessible ONLY to FLEET_MANAGER
router.get('/', authorize(['FLEET_MANAGER']), UserController.getAll);
router.post('/', authorize(['FLEET_MANAGER']), validate(createUserSchema), UserController.create);
router.put('/:id', authorize(['FLEET_MANAGER']), validate(updateUserSchema), UserController.update);
router.delete('/:id', authorize(['FLEET_MANAGER']), UserController.delete);

router.get('/permissions-matrix', authorize(['FLEET_MANAGER']), UserController.getPermissionsMatrix);

export default router;
