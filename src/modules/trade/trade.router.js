import { Router } from 'express';
import * as tradeController from './trade.controller.js';

const router = Router();

// 교환 제안 생성
router.post('/listings/:listingId/proposals', tradeController.createProposal);

// 교환 제안 목록
router.get('/listings/:listingId/proposals', tradeController.getProposals);

// 교환 수락
router.patch('/proposals/:proposalId/accept', tradeController.acceptProposal);

// 교환 거절
router.patch('/proposals/:proposalId/reject', tradeController.rejectProposal);

export default router;
