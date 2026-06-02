import prisma from '../../config/db.js';

// 1. 제안 생성

export const createProposal = async (
  saleCardId,
  offeredCardId,
  proposerId,
  message
) => {
  const saleCard = await prisma.photoCard.findUnique({
    where: { id: saleCardId },
  });

  if (!saleCard) throw new Error('판매 카드가 존재하지 않습니다.');

  const offeredCard = await prisma.photoCard.findUnique({
    where: { id: offeredCardId },
  });

  if (!offeredCard) throw new Error('제안 카드가 존재하지 않습니다.');

  // 내 카드 검증
  if (offeredCard.ownerId !== proposerId) {
    throw new Error('내 카드만 제안할 수 있습니다.');
  }

  // 중복 체크
  const existing = await prisma.tradeProposal.findFirst({
    where: {
      saleCardId,
      offeredCardId,
      status: 'PENDING',
    },
  });

  if (existing) {
    throw new Error('이미 진행 중인 제안이 있습니다.');
  }

  return prisma.tradeProposal.create({
    data: {
      saleCardId,
      offeredCardId,
      proposerId,
      message: message ?? null,
      status: 'PENDING',
    },
  });
};

// 2. 조회
export const getProposals = async (saleCardId) => {
  return prisma.tradeProposal.findMany({
    where: { saleCardId },
    orderBy: { createdAt: 'desc' },
  });
};

// 3. 수락 (트랜잭션 추가했음)

export const acceptProposal = async (saleCardId, proposalId) => {
  return prisma.$transaction(async (tx) => {
    const proposal = await tx.tradeProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) throw new Error('제안이 존재하지 않습니다.');

    if (proposal.status !== 'PENDING') {
      throw new Error('이미 처리된 제안입니다.');
    }

    const saleCard = await tx.photoCard.findUnique({
      where: { id: saleCardId },
    });

    const offeredCard = await tx.photoCard.findUnique({
      where: { id: proposal.offeredCardId },
    });

    if (!saleCard || !offeredCard) {
      throw new Error('카드 정보가 없습니다.');
    }

    // 소유권 교환
    await tx.photoCard.update({
      where: { id: saleCardId },
      data: { ownerId: offeredCard.ownerId },
    });

    await tx.photoCard.update({
      where: { id: offeredCard.id },
      data: { ownerId: saleCard.ownerId },
    });

    // 상태 변경
    const updated = await tx.tradeProposal.update({
      where: { id: proposalId },
      data: { status: 'ACCEPTED' },
    });

    // 나머지 자동 거절
    await tx.tradeProposal.updateMany({
      where: {
        saleCardId,
        status: 'PENDING',
        NOT: { id: proposalId },
      },
      data: { status: 'REJECTED' },
    });

    return updated;
  });
};

// 4. 거절

export const rejectProposal = async (proposalId) => {
  return prisma.tradeProposal.update({
    where: { id: proposalId },
    data: { status: 'REJECTED' },
  });
};
