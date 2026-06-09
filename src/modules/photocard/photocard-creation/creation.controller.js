import creationService from './creation.service.js';

// 목록
const ALLOWED_GENRES = [
  'ALBUM',
  'SPECIAL',
  'FAN_SIGN',
  'SEASON_GREETING',
  'FAN_MEETING',
  'CONCERT',
  'MD',
  'COLLABORATION',
  'FAN_CLUB',
  'OTHER',
];

async function createCard(req, res, next) {
  try {
    const creatorId = req.auth?.userId || req.auth?.id;
    const imageFile = req.file;
    const { name, grade, genre, price, totalQuantity, description } = req.body;

    // 1. 필수 입력값 검증 (400 Bad Request)
    if (!name || !genre || !price || !totalQuantity) {
      return res
        .status(400)
        .json({ success: false, message: '필수 입력값이 누락되었습니다.' });
    }
    if (!imageFile) {
      return res
        .status(400)
        .json({ success: false, message: '포토카드 이미지는 필수입니다.' });
    }

    // 2. 장르 유효성 검증
    const upperGenre = genre.toUpperCase();
    if (!ALLOWED_GENRES.includes(upperGenre)) {
      return res
        .status(400)
        .json({ success: false, message: '유효하지 않은 장르 선택입니다.' });
    }

    // 3.  총 발행량은 10장 이하로 선택 가능합니다.
    const parsedTotalIssued = Number(totalQuantity);
    if (
      Number.isNaN(parsedTotalIssued) ||
      parsedTotalIssued <= 0 ||
      parsedTotalIssued > 10
    ) {
      return res.status(400).json({
        success: false,
        message: '총 발행량은 1장 이상 10장 이하만 가능합니다.',
      });
    }

    // 4. 가격 정수형 검증
    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res
        .status(400)
        .json({ success: false, message: '가격이 유효하지 않습니다.' });
    }

    // 5. 설명란 글자 수 제한 유효성 검사 (최대 200자 제한 방어벽)
    if (description && description.length > 200) {
      return res.status(400).json({
        success: false,
        message: '포토카드 설명은 200자 이하로 입력해주세요.',
      });
    }

    // 6. 서비스 로직 호출
    const newCardData = await creationService.generatePhotoCard({
      creatorId,
      title: name,
      grade,
      genre: upperGenre,
      price: parsedPrice,
      totalIssued: parsedTotalIssued,
      description,
      imageUrl: `/uploads/${imageFile.filename}`,
    });

    // 7. 등록 성공 (201 Created)
    return res.status(201).json({
      success: true,
      message: '포토카드 생성 및 마켓 등록 성공',
      data: newCardData,
    });
  } catch (error) {
    return next(error);
  }
}

export default {
  createCard,
};
