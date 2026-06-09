import prisma from '../../../config/db.js';

// 등급 자동 부여를 위한 확률 산정 함수 (Prisma Enum 대소문자 100% 일치)
function getRandomGrade() {
  const roll = Math.random() * 100;
  if (roll < 1) return 'LEGENDARY'; // 1%
  if (roll < 6) return 'SUPER_RARE'; // 5%
  if (roll < 26) return 'RARE'; // 20%
  return 'COMMON'; // 74%
}

async function generatePhotoCard({
  creatorId,
  title,
  genre,
  price,
  totalIssued,
  description,
  imageUrl,
  grade,
}) {
  // 등급 선택지가 유효하게 넘어왔다면 대문자 변환 후 고정 적용, 'SELECT'거나 누락됐다면 랜덤 가챠 작동
  const isCustomGrade =
    grade &&
    grade !== '' &&
    grade !== 'SELECT' &&
    grade !== '등급을 선택해 주세요';
  const finalGrade = isCustomGrade ? grade.toUpperCase() : getRandomGrade();

  return await prisma.$transaction(async (tx) => {
    // 1. CardTemplate 테이블에 카드 원본 데이터 생성
    const template = await tx.cardTemplate.create({
      data: {
        creatorId,
        title,
        description,
        imageUrl,
        grade: finalGrade, // Enum 객체로 안전하게 바인딩
        genre, // 컨트롤러에서 대문자로 정제되어 넘어옴
        price,
        totalIssued,
      },
    });

    // 2. 생성 완료된 원본 아이디(template.id)를 기반으로 유저의 실물 지갑(PhotoCard)에 수량 배정
    const userCard = await tx.photoCard.upsert({
      where: {
        templateId_ownerId: {
          templateId: template.id,
          ownerId: creatorId,
        },
      },
      update: {
        quantity: { increment: totalIssued },
      },
      create: {
        templateId: template.id,
        ownerId: creatorId,
        quantity: totalIssued,
        status: 'ON_SALE', //  PhotoCardStatus.ON_SALE 상태 적용
      },
    });

    // 3. 마켓플레이스 상점 매물 대장(SaleListing) 테이블에 판매글 자동 연동 등록
    const saleListing = await tx.saleListing.create({
      data: {
        sellerId: creatorId,
        photoCardId: userCard.id,
        quantity: totalIssued,
        remainQuantity: totalIssued, // 필수값 충족
        price: price,
        status: 'SELLING', //  SaleStatus.SELLING 상태 적용
      },
    });

    return {
      template,
      userCard,
      saleListing,
    };
  });
}

export default {
  generatePhotoCard,
};
