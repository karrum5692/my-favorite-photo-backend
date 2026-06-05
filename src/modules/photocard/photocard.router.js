import express from 'express';
import * as photocardController from './photocard.controller.js';

const router = express.Router();

// GET /market/cards
router.get('/cards', photocardController.getMarketCards);

export default router;
