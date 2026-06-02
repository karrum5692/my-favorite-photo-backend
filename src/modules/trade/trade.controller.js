import * as tradeService from './trade.service.js';

// 제안 생성
export const createProposal = async (req, res, next) => {
  try {
    const saleCardId = Number(req.params.id);

    const proposerId = 1; // JWT 대체 (테스트용)
    const { offeredCardId, message } = req.body;

    const result = await tradeService.createProposal(
      saleCardId,
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

// 제안 목록
export const getProposals = async (req, res, next) => {
  try {
    const saleCardId = Number(req.params.id);

    const result = await tradeService.getProposals(saleCardId);

    res.status(200).json({
      success: true,
      message: '조회 성공',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// 수락
export const acceptProposal = async (req, res, next) => {
  try {
    const saleCardId = Number(req.params.id);
    const proposalId = Number(req.params.proposalId);

    const result = await tradeService.acceptProposal(saleCardId, proposalId);

    res.json({
      success: true,
      message: '교환 수락 성공',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

// 거절
export const rejectProposal = async (req, res, next) => {
  try {
    const proposalId = Number(req.params.proposalId);

    const result = await tradeService.rejectProposal(proposalId);

    res.json({
      success: true,
      message: '교환 거절 성공',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
