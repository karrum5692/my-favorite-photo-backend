import * as tradeService from './trade.service.js';

// 교환 제안 생성
export const createProposal = async (req, res, next) => {
  try {
    const saleListingId = Number(req.params.listingId);

    const proposerId = req.auth.userId;
    const { offeredCardId, message } = req.body;

    const result = await tradeService.createProposal(
      saleListingId,
      Number(offeredCardId),
      proposerId,
      message
    );

    res.status(201).json({
      success: true,
      message: '교환 신청 성공',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// 교환 제안 목록
export const getProposals = async (req, res, next) => {
  try {
    const saleListingId = Number(req.params.listingId);
    const currentUserId = req.auth.userId;

    const result = await tradeService.getProposals(
      saleListingId,
      currentUserId
    );

    res.status(200).json({
      success: true,
      message: '조회 성공',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// 교환 수락
export const acceptProposal = async (req, res, next) => {
  try {
    const proposalId = Number(req.params.proposalId);
    const currentUserId = req.auth.userId;
    const result = await tradeService.acceptProposal(proposalId, currentUserId);

    res.status(200).json({
      success: true,
      message: '교환 수락 성공',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// 교환 거절
export const rejectProposal = async (req, res, next) => {
  try {
    const proposalId = Number(req.params.proposalId);
    const currentUserId = req.auth.userId;

    const result = await tradeService.rejectProposal(proposalId, currentUserId);

    res.status(200).json({
      success: true,
      message: '교환 거절 성공',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
