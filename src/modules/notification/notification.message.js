function notificationMessage(type, data) {
  switch (type) {
    case 'PROPOSAL_RECEIVED': // 교환 제안 알림.
      return `${data.nickname}님이 [${data.grade} | ${data.title}]의 포토카드 교환을 제안했습니다.`;

    case 'PROPOSAL_ACCEPTED': // 교환 완료 알림.
      return `${data.nickname}님과의 [${data.grade} | ${data.title}]의 포토카드 교환이 성사되었습니다.`;

    case 'PROPOSAL_REJECTED': // 교환 거절 알림.
      return `제안하신 [${data.grade} | ${data.title}] 포토카드 교환이 거절되었습니다.`;

    case 'PURCHASE_COMPLETED': // 판매자가 받는 구매 알림.
      return `${data.nickname}님이 [${data.grade} | ${data.title}] ${data.quantity}장을 구매했습니다.`;

    case 'SOLD': // 구매자가 받는 구매 성공 알림.
      return `[${data.grade} | ${data.title}] ${data.quantity}장을 성공적으로 구매했습니다.`;

    case 'SOLD_OUT': // 판매글 품절 알림.
      return `[${data.grade} | ${data.title}]이 품절되었습니다.`;

    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}

export default notificationMessage;
