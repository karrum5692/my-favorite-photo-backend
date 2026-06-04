import { Router } from 'express';
import userController from './user.controller.js';

const router = Router();

router.get('/me', userController.getProfile);
//router.post('/gallery/cards', userController);
//router.patch('/me', userController);

export default router;
