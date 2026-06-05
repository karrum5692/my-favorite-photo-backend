import prisma from '../../config/db.js';

// 교환 제안 생성
export const createProposal = async (
  saleListingId,
  offeredCardId,
  proposerId,
  message
) => {
  const saleListing = await prisma.saleListing.findUnique({
    where: {
      id: saleListingId,
    },
    include: {
      photoCard: true,
    },
  });

  if (!saleListing) {
    throw new Error('판매글이 존재하지 않습니다.');
  }

  if (saleListing.status !== 'SELLING') {
    throw new Error('거래 가능한 판매글이 아닙니다.');
  }

  if (saleListing.sellerId === proposerId) {
    throw new Error('자신의 판매글에는 제안할 수 없습니다.');
  }

  const offeredCard = await prisma.photoCard.findUnique({
    where: {
      id: offeredCardId,
    },
  });

  if (!offeredCard) {
    throw new Error('제안 카드가 존재하지 않습니다.');
  }

  if (offeredCard.ownerId !== proposerId) {
    throw new Error('내 카드만 제안할 수 있습니다.');
  }

  const existing = await prisma.tradeProposal.findFirst({
    where: {
      saleListingId,
      proposerId,
      status: 'PENDING',
    },
  });

  if (existing) {
    throw new Error('이미 진행 중인 제안이 있습니다.');
  }

  return prisma.tradeProposal.create({
    data: {
      saleListingId,
      proposerId,
      offeredCardId,
      message: message ?? null,
      status: 'PENDING',
    },
  });
};

// 교환 제안 목록
export const getProposals = async (saleListingId) => {
  return prisma.tradeProposal.findMany({
    where: {
      saleListingId,
    },
    include: {
      proposer: true,
      offeredCard: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// 교환 수락
export const acceptProposal = async (proposalId) => {
  return prisma.$transaction(async (tx) => {
    const proposal = await tx.tradeProposal.findUnique({
      where: {
        id: proposalId,
      },
    });

    if (!proposal) {
      throw new Error('제안이 존재하지 않습니다.');
    }

    if (proposal.status !== 'PENDING') {
      throw new Error('이미 처리된 제안입니다.');
    }

    const saleListing = await tx.saleListing.findUnique({
      where: {
        id: proposal.saleListingId,
      },
      include: {
        photoCard: true,
      },
    });

    if (!saleListing) {
      throw new Error('판매글이 존재하지 않습니다.');
    }

    const saleCard = saleListing.photoCard;

    const offeredCard = await tx.photoCard.findUnique({
      where: {
        id: proposal.offeredCardId,
      },
    });

    if (!offeredCard) {
      throw new Error('제안 카드가 존재하지 않습니다.');
    }

    const saleOwnerId = saleCard.ownerId;

    const offerOwnerId = offeredCard.ownerId;

    // 카드 소유자 교환
    await tx.photoCard.update({
      where: {
        id: saleCard.id,
      },
      data: {
        ownerId: offerOwnerId,
      },
    });

    await tx.photoCard.update({
      where: {
        id: offeredCard.id,
      },
      data: {
        ownerId: saleOwnerId,
      },
    });

    // 수락 처리
    const accepted = await tx.tradeProposal.update({
      where: {
        id: proposalId,
      },
      data: {
        status: 'ACCEPTED',
        completedAt: new Date(),
      },
    });

    // 판매 완료 처리
    await tx.saleListing.update({
      where: {
        id: saleListing.id,
      },
      data: {
        status: 'SOLD',
      },
    });

    // 나머지 제안 자동 거절
    await tx.tradeProposal.updateMany({
      where: {
        saleListingId: proposal.saleListingId,
        status: 'PENDING',
        NOT: {
          id: proposalId,
        },
      },
      data: {
        status: 'REJECTED',
      },
    });

    return accepted;
  });
};

// 교환 거절
export const rejectProposal = async (proposalId) => {
  return prisma.tradeProposal.update({
    where: {
      id: proposalId,
    },
    data: {
      status: 'REJECTED',
    },
  });
};
