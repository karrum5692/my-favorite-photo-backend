import prisma from '../../config/db.js';
import notificationService from '../notification/notification.service.js';

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

  const proposal = await prisma.tradeProposal.create({
    data: {
      saleListingId,
      proposerId,
      offeredCardId,
      message: message ?? null,
      status: 'PENDING',
    },
  });
  try {
    await notificationService.createReceivedNotification(
      saleListing.sellerId,
      proposal.id
    );
  } catch (error) {
    console.log('교환 제안 알림 생성 실패:', error);
  }

  return proposal;
};

// 교환 제안 목록 조회
export const getProposals = async (saleListingId, currentUserId) => {
  const saleListing = await prisma.saleListing.findUnique({
    where: {
      id: saleListingId,
    },
  });

  if (!saleListing) {
    throw new Error('판매글이 존재하지 않습니다.');
  }

  if (saleListing.sellerId !== currentUserId) {
    throw new Error('조회 권한이 없습니다.');
  }

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
export const acceptProposal = async (proposalId, currentUserId) => {
  const accepted = await prisma.$transaction(async (tx) => {
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

    if (saleListing.sellerId !== currentUserId) {
      throw new Error('판매자만 수락할 수 있습니다.');
    }

    if (saleListing.status !== 'SELLING') {
      throw new Error('이미 종료된 거래입니다.');
    }

    /**
     * 동시성 제어
     * 이미 SOLD 된 경우 count = 0
     */
    const listingUpdateResult = await tx.saleListing.updateMany({
      where: {
        id: saleListing.id,
        status: 'SELLING',
      },
      data: {
        status: 'SOLD',
      },
    });

    if (listingUpdateResult.count === 0) {
      throw new Error('이미 처리된 거래입니다.');
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

    // 카드 교환
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
  try {
    await notificationService.createTradeAcceptedNotification(
      accepted.proposerId,
      proposalId
    );
  } catch (err) {
    console.log('교환 성사 알림 실패:', err);
  }

  return accepted;
};

// 교환 거절
export const rejectProposal = async (proposalId, currentUserId) => {
  const proposal = await prisma.tradeProposal.findUnique({
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

  const saleListing = await prisma.saleListing.findUnique({
    where: {
      id: proposal.saleListingId,
    },
  });

  if (!saleListing) {
    throw new Error('판매글이 존재하지 않습니다.');
  }

  if (saleListing.sellerId !== currentUserId) {
    throw new Error('판매자만 거절할 수 있습니다.');
  }

  const rejected = await prisma.tradeProposal.update({
    where: {
      id: proposalId,
    },
    data: {
      status: 'REJECTED',
    },
  });

  // 알림 추가
  try {
    await notificationService.createTradeRejectedNotification(
      proposal.proposerId,
      proposalId
    );
  } catch (err) {
    console.log('교환 거절 알림 생성 실패:', err);
  }

  return rejected;
};
