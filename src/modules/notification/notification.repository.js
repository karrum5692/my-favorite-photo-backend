switch (type) {
  case 'PROPOSAL_RECEIVED':
    message = `${senderNickname}님이 교환 제안을 보냈습니다.`;
    break;

  case 'PROPOSAL_ACCEPTED':
    message = `교환이 승인되었습니다.`;
    break;

  case 'PROPOSAL_REJECTED':
    message = `교환이 거절되었습니다.`;
    break;

  case 'PURCHASE_COMPLETED':
    message = `${cardName} 카드가 구매되었습니다.`;
    break;

  case 'SOLD':
    message = `${cardName} 카드가 판매되었습니다.`;
    break;

  case 'SOLD_OUT':
    message = `판매 중이던 카드가 모두 판매되어 품절되었습니다.`;
    break;
}
