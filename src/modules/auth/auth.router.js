import express from 'express';
import userController from './auth.controller.js';

const router = express.Router();

router.use('/', userController);

export default router;
