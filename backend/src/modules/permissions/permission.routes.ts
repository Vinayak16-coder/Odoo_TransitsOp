import { Router } from 'express';
import { PermissionController } from './permission.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';

const router = Router();

router.use(authenticate);

// Everyone can view the matrix
router.get('/', PermissionController.getMatrix);

// Only FLEET_MANAGER can update it (via Settings module authorization)
router.put('/', authorize('Settings'), PermissionController.update);
router.put('/bulk', authorize('Settings'), PermissionController.updateBulk);

export default router;
