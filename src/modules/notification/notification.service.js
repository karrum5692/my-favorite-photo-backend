import notificationRepository from './notification.repository.js';
import notificationMessage from './notification.message.js';

// 판매자 에게 구매자가 교환 제안 알림 .
async function createReceivedNotification(receiverId, proposalId) {
  const proposal =
    await notificationRepository.findTradeProposalById(proposalId);

  const data = {
    nickname: proposal.proposer.nickname,
    grade: proposal.saleListing.photoCard.template.grade,
    title: proposal.saleListing.photoCard.template.title,
  };

  const message = notificationMessage('PROPOSAL_RECEIVED', data);

  return notificationRepository.createNotification({
    userId: receiverId,
    type: 'PROPOSAL_RECEIVED',
    message,
  });
}

// 판매자가 받는 구매 성공 알림
async function createPurchaseNotification(receiverId, purchaseId) {
  const purchase = await notificationRepository.findPurchaseById(purchaseId);

  const data = {
    nickname: purchase.buyer.nickname,
    grade: purchase.saleListing.photoCard.template.grade,
    title: purchase.saleListing.photoCard.template.title,
    quantity: purchase.quantity,
  };

  const message = notificationMessage('PURCHASE_COMPLETED', data);

  return notificationRepository.createNotification({
    userId: receiverId,
    type: 'PURCHASE_COMPLETED',
    message,
  });
}

// 교환 성사 완료 알림 .
async function createTradeAcceptedNotification(receiverId, proposalId) {
  const proposal =
    await notificationRepository.findTradeProposalById(proposalId);

  const data = {
    nickname: proposal.saleListing.seller.nickname,
    grade: proposal.saleListing.photoCard.template.grade,
    title: proposal.saleListing.photoCard.template.title,
  };

  const message = notificationMessage('PROPOSAL_ACCEPTED', data);

  return notificationRepository.createNotification({
    userId: receiverId,
    type: 'PROPOSAL_ACCEPTED',
    message,
  });
}

// 판매 품절 알림
async function createSoldoutNotification(receiverId, saleListingId) {
  const saleListing =
    await notificationRepository.findSaleListingById(saleListingId);

  const data = {
    grade: saleListing.photoCard.template.grade,
    title: saleListing.photoCard.template.title,
  };

  const message = notificationMessage('SOLD_OUT', data);

  return notificationRepository.createNotification({
    userId: receiverId,
    type: 'SOLD_OUT',
    message,
  });
}

// 구매자가 받는 구매 성공 알림
async function createSoldNotification(buyerId, purchaseId) {
  const purchase = await notificationRepository.findPurchaseById(purchaseId);

  const data = {
    grade: purchase.saleListing.photoCard.template.grade,
    title: purchase.saleListing.photoCard.template.title,
    quantity: purchase.quantity,
  };

  const message = notificationMessage('SOLD', data);

  return notificationRepository.createNotification({
    userId: buyerId,
    type: 'SOLD',
    message,
  });
}

//교환 거절 알림 .
async function createTradeRejectedNotification(receiverId, proposalId) {
  const proposal =
    await notificationRepository.findTradeProposalById(proposalId);

  const data = {
    grade: proposal.saleListing.photoCard.template.grade,
    title: proposal.saleListing.photoCard.template.title,
  };

  const message = notificationMessage('PROPOSAL_REJECTED', data);

  return notificationRepository.createNotification({
    userId: receiverId,
    type: 'PROPOSAL_REJECTED',
    message,
  });
}

export default {
  createReceivedNotification,
  createPurchaseNotification,
  createTradeAcceptedNotification,
  createSoldoutNotification,
  createSoldNotification,
  createTradeRejectedNotification,
};
