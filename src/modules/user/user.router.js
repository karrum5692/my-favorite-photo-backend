import { Router } from 'express';
import userController from './user.controller';

const router = express.Router();

router.get('/me', userController);
router.post('/gallery/cards', userController);
router.patch('/me', userController);
