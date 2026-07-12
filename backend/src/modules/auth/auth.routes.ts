import { Router } from 'express';
import { login, refresh, logout, getMe, register } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { loginSchema, registerSchema } from './auth.schema';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/register', authenticate, authorize(['FLEET_MANAGER']), validate(registerSchema), register);

export default router;
