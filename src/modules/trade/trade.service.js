import prisma from '../../config/db.js';
import notificationService from '../notification/notification.service.js';

/**
 * 교환 제안 생성
 */
export const createProposal = async (
  saleListingId,
  offeredCardId,
  proposerId,
  message
) => {
  const saleListing = await prisma.saleListing.findUnique({
    where: { id: saleListingId },
    include: { photoCard: true },
  });

  if (
    !saleListing ||
    saleListing.status !== 'SELLING' ||
    saleListing.sellerId === proposerId
  ) {
    throw new Error('거래할 수 없는 상태이거나 잘못된 접근입니다.');
  }

  const offeredCard = await prisma.photoCard.findUnique({
    where: { id: offeredCardId },
  });
  if (!offeredCard || offeredCard.ownerId !== proposerId) {
    throw new Error('유효하지 않은 카드입니다.');
  }

  const existing = await prisma.tradeProposal.findFirst({
    where: { saleListingId, proposerId, status: 'PENDING' },
  });
  if (existing) throw new Error('이미 진행 중인 제안이 있습니다.');

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
    console.log('알림 생성 실패:', error);
  }

  return proposal;
};

/**
 * [판매자용] 내 판매글에 들어온 교환 제안 목록 조회
 * (제안한 사람 정보 + 상대방 제시 카드 + 템플릿(장르/등급) 포함)
 */
export const getProposals = async (saleListingId, currentUserId) => {
  const saleListing = await prisma.saleListing.findUnique({
    where: { id: saleListingId },
  });
  if (!saleListing || saleListing.sellerId !== currentUserId)
    throw new Error('권한이 없습니다.');

  return prisma.tradeProposal.findMany({
    where: { saleListingId },
    include: {
      proposer: {
        select: { id: true, nickname: true },
      },
      offeredCard: {
        include: { template: true },
      },
      saleListing: {
        include: {
          seller: { select: { id: true, nickname: true } },
          photoCard: {
            include: { template: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * [구매자용] 내가 보낸 교환 제안 목록 조회
 * (내가 제시한 카드 + 상대방 판매글 + 상대방 판매 카드 + 템플릿(장르/등급) 포함)
 */
export const getSentProposals = async (currentUserId) => {
  return await prisma.tradeProposal.findMany({
    where: { proposerId: currentUserId },
    include: {
      proposer: {
        select: { id: true, nickname: true },
      },
      offeredCard: {
        include: { template: true },
      },
      saleListing: {
        include: {
          seller: { select: { id: true, nickname: true } },
          photoCard: {
            include: { template: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * 교환 수락
 */
export const acceptProposal = async (proposalId, currentUserId) => {
  const accepted = await prisma.$transaction(async (tx) => {
    const proposal = await tx.tradeProposal.findUnique({
      where: { id: proposalId },
    });
    if (!proposal || proposal.status !== 'PENDING')
      throw new Error('유효하지 않은 제안입니다.');

    const saleListing = await tx.saleListing.findUnique({
      where: { id: proposal.saleListingId },
      include: { photoCard: true },
    });
    if (!saleListing || saleListing.sellerId !== currentUserId)
      throw new Error('권한이 없습니다.');

    const tradeQty = proposal.quantity;

    // remainQuantity 차감, 0이 되면 SOLD 처리
    const newRemainQty = saleListing.remainQuantity - tradeQty;
    const listingUpdateResult = await tx.saleListing.updateMany({
      where: { id: saleListing.id, status: 'SELLING' },
      data: {
        remainQuantity: newRemainQty,
        ...(newRemainQty <= 0 ? { status: 'SOLD' } : {}),
      },
    });
    if (listingUpdateResult.count === 0)
      throw new Error('이미 처리된 거래입니다.');

    const offeredCard = await tx.photoCard.findUnique({
      where: { id: proposal.offeredCardId },
    });

    // 판매자 카드 → 제안자에게 (tradeQty만큼)
    const sellerCardNewQty = saleListing.photoCard.quantity - tradeQty;
    const proposerExisting = await tx.photoCard.findUnique({
      where: {
        templateId_ownerId: {
          templateId: saleListing.photoCard.templateId,
          ownerId: offeredCard.ownerId,
        },
      },
    });
    if (proposerExisting) {
      await tx.photoCard.update({
        where: { id: proposerExisting.id },
        data: { quantity: proposerExisting.quantity + tradeQty },
      });
      await tx.photoCard.update({
        where: { id: saleListing.photoCard.id },
        data: {
          quantity: sellerCardNewQty,
          ...(sellerCardNewQty <= 0 ? { status: 'SOLD_OUT' } : {}),
        },
      });
    } else if (sellerCardNewQty <= 0) {
      // 남은 수량 없음 → 소유권 이전
      await tx.photoCard.update({
        where: { id: saleListing.photoCard.id },
        data: { ownerId: offeredCard.ownerId },
      });
    } else {
      // 남은 수량 있음 → 제안자에게 새 레코드 생성, 판매자 카드 수량 감소
      await tx.photoCard.create({
        data: {
          templateId: saleListing.photoCard.templateId,
          ownerId: offeredCard.ownerId,
          quantity: tradeQty,
        },
      });
      await tx.photoCard.update({
        where: { id: saleListing.photoCard.id },
        data: { quantity: sellerCardNewQty },
      });
    }

    // 제안자 카드 → 판매자에게 (tradeQty만큼)
    const proposerCardNewQty = offeredCard.quantity - tradeQty;
    const sellerExisting = await tx.photoCard.findUnique({
      where: {
        templateId_ownerId: {
          templateId: offeredCard.templateId,
          ownerId: saleListing.sellerId,
        },
      },
    });
    if (sellerExisting) {
      await tx.photoCard.update({
        where: { id: sellerExisting.id },
        data: { quantity: sellerExisting.quantity + tradeQty },
      });
      await tx.photoCard.update({
        where: { id: offeredCard.id },
        data: {
          quantity: proposerCardNewQty,
          ...(proposerCardNewQty <= 0 ? { status: 'SOLD_OUT' } : {}),
        },
      });
    } else if (proposerCardNewQty <= 0) {
      // 남은 수량 없음 → 소유권 이전
      await tx.photoCard.update({
        where: { id: offeredCard.id },
        data: { ownerId: saleListing.sellerId },
      });
    } else {
      // 남은 수량 있음 → 판매자에게 새 레코드 생성, 제안자 카드 수량 감소
      await tx.photoCard.create({
        data: {
          templateId: offeredCard.templateId,
          ownerId: saleListing.sellerId,
          quantity: tradeQty,
        },
      });
      await tx.photoCard.update({
        where: { id: offeredCard.id },
        data: { quantity: proposerCardNewQty },
      });
    }

    const result = await tx.tradeProposal.update({
      where: { id: proposalId },
      data: { status: 'ACCEPTED', completedAt: new Date() },
    });

    // 다른 제안들은 거절 처리
    await tx.tradeProposal.updateMany({
      where: {
        saleListingId: proposal.saleListingId,
        status: 'PENDING',
        NOT: { id: proposalId },
      },
      data: { status: 'REJECTED' },
    });

    return result;
  });

  try {
    await notificationService.createTradeAcceptedNotification(
      accepted.proposerId,
      proposalId
    );
  } catch (err) {
    console.log('알림 실패:', err);
  }
  return accepted;
};

/**
 * 교환 제안 취소 (제안자 본인)
 */
export const cancelProposal = async (proposalId, currentUserId) => {
  const proposal = await prisma.tradeProposal.findUnique({
    where: { id: proposalId },
  });
  if (!proposal || proposal.status !== 'PENDING')
    throw new Error('취소할 수 없는 제안입니다.');

  if (proposal.proposerId !== currentUserId)
    throw new Error('권한이 없습니다.');

  return prisma.tradeProposal.update({
    where: { id: proposalId },
    data: { status: 'REJECTED' },
  });
};

/**
 * 교환 거절
 */
export const rejectProposal = async (proposalId, currentUserId) => {
  const proposal = await prisma.tradeProposal.findUnique({
    where: { id: proposalId },
  });
  if (!proposal || proposal.status !== 'PENDING')
    throw new Error('처리할 수 없는 제안입니다.');

  const saleListing = await prisma.saleListing.findUnique({
    where: { id: proposal.saleListingId },
  });
  if (!saleListing || saleListing.sellerId !== currentUserId)
    throw new Error('권한이 없습니다.');

  const rejected = await prisma.tradeProposal.update({
    where: { id: proposalId },
    data: { status: 'REJECTED' },
  });

  try {
    await notificationService.createTradeRejectedNotification(
      proposal.proposerId,
      proposalId
    );
  } catch (err) {
    console.log('알림 실패:', err);
  }
  return rejected;
};
