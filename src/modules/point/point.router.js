import { Router } from 'express';

const router = Router();

router.get('/points/me');
router.post('/points/random-box');

export default router;
