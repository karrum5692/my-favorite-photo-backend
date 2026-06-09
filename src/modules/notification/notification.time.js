function notificationTime(createdAt) {
  const now = new Date();
  const diffMs = now - new Date(createdAt);

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (hours < 1) return '방금 전';
  if (hours < 24) return `${hours}시간 전`;
  if (days <= 6) return `${days}일 전`;
  if (weeks <= 3) return `${weeks}주일 전`;
  if (days <= 30 * 11) return `${months}개월 전`;
  return `${years}년 전`;
}

export default notificationTime;
