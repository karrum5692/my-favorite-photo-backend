import prisma from '../../../config/db.js';

//내가 owned한 포토카드 가져오기
async function getMyOwnedCards(userId, filters = {}) {
  const { search, grade, genre } = filters;

  const whereCondition = {
    ownerId: userId,
    quantity: {
      gt: 0,
    },
    status: 'OWNED',
  };

  const templateFilter = {};
  if (search) templateFilter.title = { contains: search, mode: 'insensitive' };
  if (grade) templateFilter.grade = grade;
  if (genre) templateFilter.genre = genre;

  if (Object.keys(templateFilter).length > 0) {
    whereCondition.template = templateFilter;
  }

  const cards = await prisma.photoCard.findMany({
    where: whereCondition,
    include: {
      owner: {
        select: {
          nickname: true,
        },
      },
      template: {
        select: {
          title: true,
          imageUrl: true,
          grade: true,
          genre: true,
          price: true,
        },
      },
    },
  });

  const cardList = cards.map((card) => ({
    id: card.id,
    nickname: card.owner.nickname,
    quantity: card.quantity,
    title: card.template.title,
    imageUrl: card.template.imageUrl,
    grade: card.template.grade,
    genre: card.template.genre,
    price: card.template.price,
  }));

  return { card: cardList };
}

//포토카드 판매하기 생성
async function createSale(ownerId, photoCardId, data) {
  return await prisma.$transaction(async (tx) => {
    const card = await tx.photoCard.findUnique({
      where: { id: photoCardId },
    });

    if (!card) {
      throw new Error('카드가 존재하지 않습니다.');
    }

    if (card.ownerId !== ownerId) {
      throw new Error('본인의 카드가 아닙니다.');
    }

    //카드 상태 먼저 검증
    if (card.status !== 'OWNED') {
      throw new Error(
        `카드가 ${card.status}상태라 판매글을 등록할 수 없습니다.`
      );
    }

    // 판매글이 존재하는지 -> 동일 카드가 selling 중인지 확인
    const existedList = await tx.saleListing.findFirst({
      where: { photoCardId: photoCardId, status: 'SELLING' },
    });

    if (existedList) {
      throw new Error(
        '이미 판매 중인 카드입니다. 판매글을 확인하시길 바랍니다.'
      );
    }

    // 보유 수량 범위 내에서 판매수량을 선택해야함
    if (data.quantity > card.quantity) {
      throw new Error('판매 수량은 보유 수량을 초과할 수 없습니다.');
    }

    await tx.photoCard.update({
      where: {
        id: photoCardId,
      },
      data: {
        status: 'ON_SALE',
      },
    });

    const sale = await tx.saleListing.create({
      data: {
        seller: { connect: { id: ownerId } },
        remainQuantity: data.quantity,
        photoCard: { connect: { id: photoCardId } },
        quantity: data.quantity,
        price: data.price,
        exchangeGrade: data.exchangeGrade,
        exchangeGenre: data.exchangeGenre,
        exchangeDescription: data.exchangeDescription,
      },
    });

    return sale;
  });
}

export default { getMyOwnedCards, createSale };
