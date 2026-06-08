import { Router } from 'express';
import getSaleCard from './saleModule.controller.js';
import auth from '../../../middlewares/auth.middleware.js';

const router = Router();

router.get('/mycard', auth.verifyAccessToken, getSaleCard);

export default router;
