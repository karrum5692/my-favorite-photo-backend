import { Router } from 'express';
import * as tradeController from './trade.controller.js';
import auth from '../../middlewares/auth.middleware.js';

const router = Router();

// 교환 제안 생성
router.post(
  '/listings/:listingId/proposals',
  auth.verifyAccessToken,
  tradeController.createProposal
);

// 교환 제안 목록
router.get(
  '/listings/:listingId/proposals',
  auth.verifyAccessToken,
  tradeController.getProposals
);

// 교환 수락
router.patch(
  '/proposals/:proposalId/accept',
  auth.verifyAccessToken,
  tradeController.acceptProposal
);

// 교환 거절
router.patch(
  '/proposals/:proposalId/reject',
  auth.verifyAccessToken,
  tradeController.rejectProposal
);

export default router;
