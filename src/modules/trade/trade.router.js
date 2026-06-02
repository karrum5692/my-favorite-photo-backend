import { Router } from 'express';
import * as tradeController from './trade.controller.js';

const router = Router();

// 교환 제안 생성
router.post('/cards/:id/proposals', tradeController.createProposal);

// 카드 제안 목록
router.get('/cards/:id/proposals', tradeController.getProposals);

// 수락
router.patch('/proposals/:proposalId/accept', tradeController.acceptProposal);

// 거절
router.patch('/proposals/:proposalId/reject', tradeController.rejectProposal);

export default router;
