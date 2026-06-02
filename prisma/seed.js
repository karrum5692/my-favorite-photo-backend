import {
  PrismaClient,
  Grade,
  Genre,
  PhotoCardStatus,
  SaleStatus,
  ProposalStatus,
  PointType,
  NotificationType,
  NotificationRelatedType,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// =====================
// 장르 매핑
// =====================
const genreMap = {
  앨범: Genre.ALBUM,
  특전: Genre.SPECIAL,
  팬싸: Genre.FAN_SIGN,
  시즌그리팅: Genre.SEASON_GREETING,
  팬미팅: Genre.FAN_MEETING,
  콘서트: Genre.CONCERT,
  MD: Genre.MD,
  콜라보: Genre.COLLABORATION,
  팬클럽: Genre.FAN_CLUB,
  기타: Genre.OTHER,
};

const gradeMap = {
  common: Grade.COMMON,
  rare: Grade.RARE,
  'super rare': Grade.SUPER_RARE,
  legendary: Grade.LEGENDARY,
};

// =====================
// Raw Data
// =====================
const RAW_USERS = [
  {
    seq: 1,
    nickname: 'user1',
    email: 'user1@example.com',
    password: 'password1',
    points: 16000,
  },
  {
    seq: 2,
    nickname: 'user2',
    email: 'user2@example.com',
    password: 'password2',
    points: 17000,
  },
  {
    seq: 3,
    nickname: 'user3',
    email: 'user3@example.com',
    password: 'password3',
    points: 24000,
  },
  {
    seq: 4,
    nickname: 'user4',
    email: 'user4@example.com',
    password: 'password4',
    points: 19000,
  },
  {
    seq: 5,
    nickname: 'user5',
    email: 'user5@example.com',
    password: 'password5',
    points: 25000,
  },
  {
    seq: 6,
    nickname: 'user6',
    email: 'user6@example.com',
    password: 'password6',
    points: 20000,
  },
  {
    seq: 7,
    nickname: 'user7',
    email: 'user7@example.com',
    password: 'password7',
    points: 14000,
  },
  {
    seq: 8,
    nickname: 'user8',
    email: 'user8@example.com',
    password: 'password8',
    points: 5000,
  },
  {
    seq: 9,
    nickname: 'user9',
    email: 'user9@example.com',
    password: 'password9',
    points: 12000,
  },
  {
    seq: 10,
    nickname: 'user10',
    email: 'user10@example.com',
    password: 'password10',
    points: 27000,
  },
  {
    seq: 11,
    nickname: 'user11',
    email: 'user11@example.com',
    password: 'password11',
    points: 2000,
  },
  {
    seq: 12,
    nickname: 'user12',
    email: 'user12@example.com',
    password: 'password12',
    points: 2000,
  },
  {
    seq: 13,
    nickname: 'user13',
    email: 'user13@example.com',
    password: 'password13',
    points: 15000,
  },
  {
    seq: 14,
    nickname: 'user14',
    email: 'user14@example.com',
    password: 'password14',
    points: 2000,
  },
  {
    seq: 15,
    nickname: 'user15',
    email: 'user15@example.com',
    password: 'password15',
    points: 11000,
  },
  {
    seq: 16,
    nickname: 'user16',
    email: 'user16@example.com',
    password: 'password16',
    points: 18000,
  },
  {
    seq: 17,
    nickname: 'user17',
    email: 'user17@example.com',
    password: 'password17',
    points: 1000,
  },
  {
    seq: 18,
    nickname: 'user18',
    email: 'user18@example.com',
    password: 'password18',
    points: 2000,
  },
  {
    seq: 19,
    nickname: 'user19',
    email: 'user19@example.com',
    password: 'password19',
    points: 19000,
  },
  {
    seq: 20,
    nickname: 'user20',
    email: 'user20@example.com',
    password: 'password20',
    points: 7000,
  },
];

const RAW_TEMPLATES = [
  {
    seq: 1,
    userSeq: 2,
    name: '빌리 문수아 콘서트',
    description: '빌리 문수아 콘서트 포카입니다.',
    genre: '콘서트',
    grade: 'common',
    price: 8000,
    totalQuantity: 3,
    imageUrl: 'https://picsum.photos/360/270?random=10',
  },
  {
    seq: 2,
    userSeq: 11,
    name: 'NCT 유우시 특전',
    description: 'NCT 유우시 특전 포카입니다.',
    genre: '특전',
    grade: 'super rare',
    price: 22000,
    totalQuantity: 1,
    imageUrl: 'https://picsum.photos/360/270?random=11',
  },
  {
    seq: 3,
    userSeq: 14,
    name: 'NCT 시온 앨범',
    description: 'NCT 시온 앨범 포카입니다.',
    genre: '앨범',
    grade: 'rare',
    price: 12000,
    totalQuantity: 3,
    imageUrl: 'https://picsum.photos/360/270?random=13',
  },
  {
    seq: 4,
    userSeq: 4,
    name: '소녀시대 유리 콜라보',
    description: '소녀시대 유리 콜라보 포카입니다.',
    genre: '콜라보',
    grade: 'common',
    price: 10000,
    totalQuantity: 2,
    imageUrl: 'https://picsum.photos/360/270?random=15',
  },
  {
    seq: 5,
    userSeq: 20,
    name: 'IVE 레이 콜라보',
    description: 'IVE 레이 콜라보 포카입니다.',
    genre: '콜라보',
    grade: 'super rare',
    price: 26000,
    totalQuantity: 1,
    imageUrl: 'https://picsum.photos/360/270?random=8',
  },
  {
    seq: 6,
    userSeq: 7,
    name: '소녀시대 태연 MD',
    description: '소녀시대 태연 MD 포카입니다.',
    genre: 'MD',
    grade: 'common',
    price: 27000,
    totalQuantity: 1,
    imageUrl: 'https://picsum.photos/360/270?random=14',
  },
  {
    seq: 7,
    userSeq: 15,
    name: 'DKZ 재찬 팬싸',
    description: 'DKZ 재찬 팬싸 포카입니다.',
    genre: '팬싸',
    grade: 'super rare',
    price: 12000,
    totalQuantity: 2,
    imageUrl: 'https://picsum.photos/360/270?random=5',
  },
  {
    seq: 8,
    userSeq: 20,
    name: 'DAY6 도운 콘서트',
    description: 'DAY6 도운 콘서트 포카입니다.',
    genre: '콘서트',
    grade: 'common',
    price: 17000,
    totalQuantity: 1,
    imageUrl: 'https://picsum.photos/360/270?random=1',
  },
  {
    seq: 9,
    userSeq: 13,
    name: '트와이스 채영 팬싸',
    description: '트와이스 채영 팬싸 포카입니다.',
    genre: '팬싸',
    grade: 'legendary',
    price: 8000,
    totalQuantity: 1,
    imageUrl: 'https://picsum.photos/360/270?random=18',
  },
  {
    seq: 10,
    userSeq: 14,
    name: '이달의 소녀 현진 기타',
    description: '이달의 소녀 현진 기타 포카입니다.',
    genre: '기타',
    grade: 'legendary',
    price: 21000,
    totalQuantity: 2,
    imageUrl: 'https://picsum.photos/360/270?random=2',
  },
  {
    seq: 11,
    userSeq: 10,
    name: '우주소녀 은서 콘서트',
    description: '우주소녀 은서 콘서트 포카입니다.',
    genre: '콘서트',
    grade: 'common',
    price: 29000,
    totalQuantity: 1,
    imageUrl: 'https://picsum.photos/360/270?random=14',
  },
  {
    seq: 12,
    userSeq: 2,
    name: '세븐틴 준 팬싸',
    description: '세븐틴 준 팬싸 포카입니다.',
    genre: '팬싸',
    grade: 'common',
    price: 17000,
    totalQuantity: 2,
    imageUrl: 'https://picsum.photos/360/270?random=16',
  },
  {
    seq: 13,
    userSeq: 13,
    name: 'DKZ 재찬 앨범',
    description: 'DKZ 재찬 앨범 포카입니다.',
    genre: '앨범',
    grade: 'rare',
    price: 8000,
    totalQuantity: 1,
    imageUrl: 'https://picsum.photos/360/270?random=7',
  },
  {
    seq: 14,
    userSeq: 3,
    name: '베리베리 호영 콘서트',
    description: '베리베리 호영 콘서트 포카입니다.',
    genre: '콘서트',
    grade: 'rare',
    price: 9000,
    totalQuantity: 2,
    imageUrl: 'https://picsum.photos/360/270?random=13',
  },
  {
    seq: 15,
    userSeq: 9,
    name: '세븐틴 조슈아 콘서트',
    description: '세븐틴 조슈아 콘서트 포카입니다.',
    genre: '콘서트',
    grade: 'common',
    price: 21000,
    totalQuantity: 2,
    imageUrl: 'https://picsum.photos/360/270?random=2',
  },
  {
    seq: 16,
    userSeq: 3,
    name: '여자아이들 민니 팬싸',
    description: '여자아이들 민니 팬싸 포카입니다.',
    genre: '팬싸',
    grade: 'super rare',
    price: 28000,
    totalQuantity: 1,
    imageUrl: 'https://picsum.photos/360/270?random=8',
  },
  {
    seq: 17,
    userSeq: 10,
    name: 'TXT 휴닝카이 특전',
    description: 'TXT 휴닝카이 특전 포카입니다.',
    genre: '특전',
    grade: 'common',
    price: 25000,
    totalQuantity: 3,
    imageUrl: 'https://picsum.photos/360/270?random=19',
  },
  {
    seq: 18,
    userSeq: 1,
    name: '여자아이들 우기 콘서트',
    description: '여자아이들 우기 콘서트 포카입니다.',
    genre: '콘서트',
    grade: 'common',
    price: 18000,
    totalQuantity: 1,
    imageUrl: 'https://picsum.photos/360/270?random=3',
  },
  {
    seq: 19,
    userSeq: 5,
    name: '세븐틴 민규 팬싸',
    description: '세븐틴 민규 팬싸 포카입니다.',
    genre: '팬싸',
    grade: 'legendary',
    price: 19000,
    totalQuantity: 2,
    imageUrl: 'https://picsum.photos/360/270?random=6',
  },
  {
    seq: 20,
    userSeq: 10,
    name: 'NCT 정우 팬미팅',
    description: 'NCT 정우 팬미팅 포카입니다.',
    genre: '팬미팅',
    grade: 'rare',
    price: 8000,
    totalQuantity: 3,
    imageUrl: 'https://picsum.photos/360/270?random=5',
  },
  {
    seq: 21,
    userSeq: 3,
    name: '스테이씨 수민 특전',
    description: '스테이씨 수민 특전 포카입니다.',
    genre: '특전',
    grade: 'common',
    price: 24000,
    totalQuantity: 3,
    imageUrl: 'https://picsum.photos/360/270?random=6',
  },
  {
    seq: 22,
    userSeq: 12,
    name: 'CIX BX MD',
    description: 'CIX BX MD 포카입니다.',
    genre: 'MD',
    grade: 'legendary',
    price: 18000,
    totalQuantity: 2,
    imageUrl: 'https://picsum.photos/360/270?random=11',
  },
  {
    seq: 23,
    userSeq: 15,
    name: 'NCT 쟈니 시즌그리팅',
    description: 'NCT 쟈니 시즌그리팅 포카입니다.',
    genre: '시즌그리팅',
    grade: 'super rare',
    price: 20000,
    totalQuantity: 1,
    imageUrl: 'https://picsum.photos/360/270?random=7',
  },
  {
    seq: 24,
    userSeq: 13,
    name: 'IVE 가을 앨범',
    description: 'IVE 가을 앨범 포카입니다.',
    genre: '앨범',
    grade: 'rare',
    price: 21000,
    totalQuantity: 2,
    imageUrl: 'https://picsum.photos/360/270?random=1',
  },
  {
    seq: 25,
    userSeq: 3,
    name: 'EVNNE 박지후 MD',
    description: 'EVNNE 박지후 MD 포카입니다.',
    genre: 'MD',
    grade: 'super rare',
    price: 11000,
    totalQuantity: 2,
    imageUrl: 'https://picsum.photos/360/270?random=3',
  },
  {
    seq: 26,
    userSeq: 11,
    name: '세븐틴 민규 특전',
    description: '세븐틴 민규 특전 포카입니다.',
    genre: '특전',
    grade: 'rare',
    price: 20000,
    totalQuantity: 2,
    imageUrl: 'https://picsum.photos/360/270?random=11',
  },
  {
    seq: 27,
    userSeq: 14,
    name: '소녀시대 써니 MD',
    description: '소녀시대 써니 MD 포카입니다.',
    genre: 'MD',
    grade: 'legendary',
    price: 20000,
    totalQuantity: 3,
    imageUrl: 'https://picsum.photos/360/270?random=18',
  },
  {
    seq: 28,
    userSeq: 7,
    name: 'EXO 시우민 콜라보',
    description: 'EXO 시우민 콜라보 포카입니다.',
    genre: '콜라보',
    grade: 'rare',
    price: 20000,
    totalQuantity: 1,
    imageUrl: 'https://picsum.photos/360/270?random=0',
  },
  {
    seq: 29,
    userSeq: 2,
    name: 'NCT 쟈니 팬미팅',
    description: 'NCT 쟈니 팬미팅 포카입니다.',
    genre: '팬미팅',
    grade: 'legendary',
    price: 28000,
    totalQuantity: 3,
    imageUrl: 'https://picsum.photos/360/270?random=15',
  },
  {
    seq: 30,
    userSeq: 18,
    name: '에이티즈 산 앨범',
    description: '에이티즈 산 앨범 포카입니다.',
    genre: '앨범',
    grade: 'super rare',
    price: 15000,
    totalQuantity: 1,
    imageUrl: 'https://picsum.photos/360/270?random=9',
  },
];

async function main() {
  console.log('🌱 Seeding started...');

  // =====================
  // 1. Users
  // =====================
  console.log('👤 Creating users...');
  const userIdMap = new Map(); // seq -> uuid

  for (const u of RAW_USERS) {
    const hashed = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.create({
      data: {
        email: u.email,
        password: hashed,
        nickname: u.nickname,
      },
    });
    userIdMap.set(u.seq, user.id);
  }

  // =====================
  // 2. Points
  // =====================
  console.log('💰 Creating points...');
  for (const u of RAW_USERS) {
    const userId = userIdMap.get(u.seq);
    await prisma.point.create({
      data: {
        userId,
        balance: u.points,
      },
    });
  }

  // =====================
  // 3. CardTemplates
  // =====================
  console.log('🃏 Creating card templates...');
  const templateIdMap = new Map(); // seq -> db id

  for (const t of RAW_TEMPLATES) {
    const creatorId = userIdMap.get(t.userSeq);
    const template = await prisma.cardTemplate.create({
      data: {
        creatorId,
        title: t.name,
        description: t.description,
        imageUrl: t.imageUrl,
        grade: gradeMap[t.grade],
        genre: genreMap[t.genre],
        price: t.price,
        totalIssued: t.totalQuantity,
      },
    });
    templateIdMap.set(t.seq, template.id);
  }

  // =====================
  // 4. PhotoCards
  // =====================
  console.log('📸 Creating photo cards...');
  const photoCardIdMap = new Map(); // "templateSeq-ownerSeq" -> db id

  const photoCardOwnerMap = [
    {
      templateSeq: 1,
      ownerSeq: 2,
      quantity: 2,
      status: PhotoCardStatus.ON_SALE,
    },
    {
      templateSeq: 3,
      ownerSeq: 14,
      quantity: 1,
      status: PhotoCardStatus.OWNED,
    },
    { templateSeq: 3, ownerSeq: 5, quantity: 1, status: PhotoCardStatus.OWNED },
    {
      templateSeq: 4,
      ownerSeq: 4,
      quantity: 1,
      status: PhotoCardStatus.ON_SALE,
    },
    { templateSeq: 4, ownerSeq: 6, quantity: 1, status: PhotoCardStatus.OWNED },
    {
      templateSeq: 5,
      ownerSeq: 20,
      quantity: 1,
      status: PhotoCardStatus.ON_SALE,
    },
    {
      templateSeq: 6,
      ownerSeq: 7,
      quantity: 1,
      status: PhotoCardStatus.ON_SALE,
    },
    {
      templateSeq: 8,
      ownerSeq: 20,
      quantity: 1,
      status: PhotoCardStatus.OWNED,
    },
    {
      templateSeq: 10,
      ownerSeq: 14,
      quantity: 1,
      status: PhotoCardStatus.ON_SALE,
    },
    {
      templateSeq: 12,
      ownerSeq: 2,
      quantity: 1,
      status: PhotoCardStatus.OWNED,
    },
    {
      templateSeq: 12,
      ownerSeq: 8,
      quantity: 1,
      status: PhotoCardStatus.OWNED,
    },
    {
      templateSeq: 13,
      ownerSeq: 13,
      quantity: 1,
      status: PhotoCardStatus.OWNED,
    },
    {
      templateSeq: 14,
      ownerSeq: 3,
      quantity: 1,
      status: PhotoCardStatus.ON_SALE,
    },
    {
      templateSeq: 14,
      ownerSeq: 9,
      quantity: 1,
      status: PhotoCardStatus.OWNED,
    },
    {
      templateSeq: 15,
      ownerSeq: 9,
      quantity: 2,
      status: PhotoCardStatus.ON_SALE,
    },
    {
      templateSeq: 16,
      ownerSeq: 3,
      quantity: 1,
      status: PhotoCardStatus.ON_SALE,
    },
    {
      templateSeq: 18,
      ownerSeq: 1,
      quantity: 1,
      status: PhotoCardStatus.OWNED,
    },
    {
      templateSeq: 19,
      ownerSeq: 5,
      quantity: 1,
      status: PhotoCardStatus.ON_SALE,
    },
    {
      templateSeq: 19,
      ownerSeq: 16,
      quantity: 1,
      status: PhotoCardStatus.OWNED,
    },
    {
      templateSeq: 20,
      ownerSeq: 10,
      quantity: 1,
      status: PhotoCardStatus.IN_TRADE,
    },
    {
      templateSeq: 21,
      ownerSeq: 3,
      quantity: 1,
      status: PhotoCardStatus.ON_SALE,
    },
    {
      templateSeq: 24,
      ownerSeq: 13,
      quantity: 1,
      status: PhotoCardStatus.OWNED,
    },
    {
      templateSeq: 25,
      ownerSeq: 3,
      quantity: 2,
      status: PhotoCardStatus.OWNED,
    },
    {
      templateSeq: 26,
      ownerSeq: 11,
      quantity: 1,
      status: PhotoCardStatus.ON_SALE,
    },
    {
      templateSeq: 27,
      ownerSeq: 14,
      quantity: 3,
      status: PhotoCardStatus.OWNED,
    },
    {
      templateSeq: 29,
      ownerSeq: 2,
      quantity: 2,
      status: PhotoCardStatus.OWNED,
    },
    {
      templateSeq: 30,
      ownerSeq: 18,
      quantity: 1,
      status: PhotoCardStatus.ON_SALE,
    },
  ];

  for (const pc of photoCardOwnerMap) {
    const ownerId = userIdMap.get(pc.ownerSeq);
    const templateId = templateIdMap.get(pc.templateSeq);
    const card = await prisma.photoCard.create({
      data: {
        templateId,
        ownerId,
        quantity: pc.quantity,
        status: pc.status,
      },
    });
    photoCardIdMap.set(`${pc.templateSeq}-${pc.ownerSeq}`, card.id);
  }

  // =====================
  // 5. SaleListings
  // =====================
  console.log('🏪 Creating sale listings...');
  const saleListingIds = [];
  const saleListingIdMap = new Map(); // listingIdx -> db id

  const saleListingData = [
    {
      templateSeq: 1,
      sellerSeq: 2,
      quantity: 2,
      price: 8000,
      exGrade: Grade.RARE,
      exGenre: Genre.ALBUM,
      exDesc: 'RARE 등급 앨범 포카로 교환 원해요',
    },
    {
      templateSeq: 5,
      sellerSeq: 20,
      quantity: 1,
      price: 26000,
      exGrade: Grade.SUPER_RARE,
      exGenre: Genre.FAN_SIGN,
      exDesc: 'SR 팬싸 포카로 교환 희망합니다',
    },
    {
      templateSeq: 6,
      sellerSeq: 7,
      quantity: 1,
      price: 27000,
      exGrade: null,
      exGenre: null,
      exDesc: null,
    },
    {
      templateSeq: 10,
      sellerSeq: 14,
      quantity: 1,
      price: 21000,
      exGrade: Grade.LEGENDARY,
      exGenre: Genre.CONCERT,
      exDesc: '레전더리 콘서트 포카로 교환해요',
    },
    {
      templateSeq: 14,
      sellerSeq: 3,
      quantity: 1,
      price: 9000,
      exGrade: Grade.RARE,
      exGenre: Genre.ALBUM,
      exDesc: 'RARE 앨범 포카 교환 원합니다',
    },
    {
      templateSeq: 15,
      sellerSeq: 9,
      quantity: 2,
      price: 21000,
      exGrade: null,
      exGenre: null,
      exDesc: null,
    },
    {
      templateSeq: 16,
      sellerSeq: 3,
      quantity: 1,
      price: 28000,
      exGrade: Grade.SUPER_RARE,
      exGenre: Genre.FAN_SIGN,
      exDesc: 'SR 팬싸 교환 원해요',
    },
    {
      templateSeq: 19,
      sellerSeq: 5,
      quantity: 1,
      price: 19000,
      exGrade: Grade.LEGENDARY,
      exGenre: Genre.FAN_SIGN,
      exDesc: '레전더리 팬싸 포카면 교환해요',
    },
    {
      templateSeq: 21,
      sellerSeq: 3,
      quantity: 1,
      price: 24000,
      exGrade: null,
      exGenre: null,
      exDesc: null,
    },
    {
      templateSeq: 26,
      sellerSeq: 11,
      quantity: 1,
      price: 20000,
      exGrade: Grade.RARE,
      exGenre: Genre.SPECIAL,
      exDesc: 'RARE 특전 교환 희망',
    },
    {
      templateSeq: 30,
      sellerSeq: 18,
      quantity: 1,
      price: 15000,
      exGrade: Grade.SUPER_RARE,
      exGenre: Genre.ALBUM,
      exDesc: 'SR 앨범 포카로 교환해요',
    },
    {
      templateSeq: 4,
      sellerSeq: 4,
      quantity: 1,
      price: 10000,
      exGrade: null,
      exGenre: null,
      exDesc: null,
    },
  ];

  for (const sl of saleListingData) {
    const sellerId = userIdMap.get(sl.sellerSeq);
    const photoCardId = photoCardIdMap.get(`${sl.templateSeq}-${sl.sellerSeq}`);
    const listing = await prisma.saleListing.create({
      data: {
        sellerId,
        photoCardId,
        quantity: sl.quantity,
        remainQuantity: sl.quantity,
        price: sl.price,
        status: SaleStatus.SELLING,
        exchangeGrade: sl.exGrade,
        exchangeGenre: sl.exGenre,
        exchangeDescription: sl.exDesc,
      },
    });
    saleListingIds.push(listing.id);
    saleListingIdMap.set(saleListingIds.length - 1, listing.id);
  }

  // =====================
  // 6. TradeProposals
  // =====================
  console.log('🔄 Creating trade proposals...');
  const tradeProposalIds = [];

  const tradeProposalData = [
    {
      listingIdx: 0,
      proposerSeq: 5,
      offeredTemplateSeq: 3,
      offeredOwnerSeq: 5,
      quantity: 1,
      status: ProposalStatus.PENDING,
    },
    {
      listingIdx: 0,
      proposerSeq: 6,
      offeredTemplateSeq: 4,
      offeredOwnerSeq: 6,
      quantity: 1,
      status: ProposalStatus.REJECTED,
    },
    {
      listingIdx: 1,
      proposerSeq: 9,
      offeredTemplateSeq: 14,
      offeredOwnerSeq: 9,
      quantity: 1,
      status: ProposalStatus.PENDING,
    },
    {
      listingIdx: 3,
      proposerSeq: 8,
      offeredTemplateSeq: 12,
      offeredOwnerSeq: 8,
      quantity: 1,
      status: ProposalStatus.PENDING,
    },
    {
      listingIdx: 4,
      proposerSeq: 16,
      offeredTemplateSeq: 19,
      offeredOwnerSeq: 16,
      quantity: 1,
      status: ProposalStatus.PENDING,
    },
    {
      listingIdx: 5,
      proposerSeq: 13,
      offeredTemplateSeq: 24,
      offeredOwnerSeq: 13,
      quantity: 1,
      status: ProposalStatus.ACCEPTED,
    },
    {
      listingIdx: 6,
      proposerSeq: 5,
      offeredTemplateSeq: 19,
      offeredOwnerSeq: 16,
      quantity: 1,
      status: ProposalStatus.PENDING,
    },
    {
      listingIdx: 7,
      proposerSeq: 10,
      offeredTemplateSeq: 20,
      offeredOwnerSeq: 10,
      quantity: 1,
      status: ProposalStatus.PENDING,
    },
    {
      listingIdx: 9,
      proposerSeq: 2,
      offeredTemplateSeq: 29,
      offeredOwnerSeq: 2,
      quantity: 1,
      status: ProposalStatus.PENDING,
    },
    {
      listingIdx: 10,
      proposerSeq: 3,
      offeredTemplateSeq: 25,
      offeredOwnerSeq: 3,
      quantity: 1,
      status: ProposalStatus.REJECTED,
    },
    {
      listingIdx: 10,
      proposerSeq: 14,
      offeredTemplateSeq: 27,
      offeredOwnerSeq: 14,
      quantity: 1,
      status: ProposalStatus.PENDING,
    },
    {
      listingIdx: 2,
      proposerSeq: 18,
      offeredTemplateSeq: 30,
      offeredOwnerSeq: 18,
      quantity: 1,
      status: ProposalStatus.PENDING,
    },
  ];

  for (const tp of tradeProposalData) {
    const saleListingId = saleListingIds[tp.listingIdx];
    const proposerId = userIdMap.get(tp.proposerSeq);
    const offeredCardId = photoCardIdMap.get(
      `${tp.offeredTemplateSeq}-${tp.offeredOwnerSeq}`
    );

    const proposal = await prisma.tradeProposal.create({
      data: {
        saleListingId,
        proposerId,
        offeredCardId,
        quantity: tp.quantity,
        status: tp.status,
        completedAt: tp.status === ProposalStatus.ACCEPTED ? new Date() : null,
      },
    });
    tradeProposalIds.push(proposal.id);

    // 교환 제안 알림 (판매자에게)
    const listing = saleListingData[tp.listingIdx];
    const sellerUserId = userIdMap.get(listing.sellerSeq);
    await prisma.notification.create({
      data: {
        userId: sellerUserId,
        type: NotificationType.PROPOSAL_RECEIVED,
        message: '새로운 교환 제안이 도착했습니다.',
        isRead: false,
      },
    });

    // 수락/거절 알림 (제안자에게)
    if (tp.status === ProposalStatus.ACCEPTED) {
      await prisma.notification.create({
        data: {
          userId: proposerId,
          type: NotificationType.PROPOSAL_ACCEPTED,
          message: '교환 제안이 수락되었습니다.',
          isRead: false,
        },
      });
    } else if (tp.status === ProposalStatus.REJECTED) {
      await prisma.notification.create({
        data: {
          userId: proposerId,
          type: NotificationType.PROPOSAL_REJECTED,
          message: '교환 제안이 거절되었습니다.',
          isRead: false,
        },
      });
    }
  }

  // =====================
  // 7. Purchases
  // =====================
  console.log('🛒 Creating purchases...');

  const purchaseData = [
    {
      buyerSeq: 1,
      sellerSeq: 2,
      templateSeq: 1,
      listingIdx: 0,
      quantity: 1,
      price: 8000,
    },
    {
      buyerSeq: 6,
      sellerSeq: 4,
      templateSeq: 4,
      listingIdx: 11,
      quantity: 1,
      price: 10000,
    },
    {
      buyerSeq: 11,
      sellerSeq: 9,
      templateSeq: 15,
      listingIdx: 5,
      quantity: 1,
      price: 21000,
    },
    {
      buyerSeq: 17,
      sellerSeq: 7,
      templateSeq: 6,
      listingIdx: 2,
      quantity: 1,
      price: 27000,
    },
    {
      buyerSeq: 8,
      sellerSeq: 3,
      templateSeq: 14,
      listingIdx: 4,
      quantity: 1,
      price: 9000,
    },
    {
      buyerSeq: 19,
      sellerSeq: 11,
      templateSeq: 26,
      listingIdx: 9,
      quantity: 1,
      price: 20000,
    },
  ];

  for (const p of purchaseData) {
    const buyerId = userIdMap.get(p.buyerSeq);
    const sellerId = userIdMap.get(p.sellerSeq);
    const photoCardId = photoCardIdMap.get(`${p.templateSeq}-${p.sellerSeq}`);
    const saleListingId = saleListingIds[p.listingIdx];
    const totalPrice = p.price * p.quantity;

    const purchase = await prisma.purchase.create({
      data: {
        buyerId,
        sellerId,
        photoCardId,
        saleListingId,
        quantity: p.quantity,
        price: p.price,
      },
    });

    // PointHistory: 구매자 차감
    await prisma.pointHistory.create({
      data: {
        userId: buyerId,
        purchaseId: purchase.id,
        amount: -totalPrice,
        type: PointType.PURCHASE,
      },
    });

    // PointHistory: 판매자 적립
    await prisma.pointHistory.create({
      data: {
        userId: sellerId,
        purchaseId: purchase.id,
        amount: totalPrice,
        type: PointType.SALE,
      },
    });

    // Point 잔액 업데이트: 구매자 차감
    await prisma.point.update({
      where: { userId: buyerId },
      data: { balance: { decrement: totalPrice } },
    });

    // Point 잔액 업데이트: 판매자 적립
    await prisma.point.update({
      where: { userId: sellerId },
      data: { balance: { increment: totalPrice } },
    });

    // SaleListing remainQuantity 차감
    await prisma.saleListing.update({
      where: { id: saleListingId },
      data: { remainQuantity: { decrement: p.quantity } },
    });

    // 구매 완료 알림 (구매자에게)
    await prisma.notification.create({
      data: {
        userId: buyerId,
        type: NotificationType.PURCHASE_COMPLETED,
        message: '포토카드 구매가 완료되었습니다.',
        isRead: false,
      },
    });

    // 판매 완료 알림 (판매자에게)
    await prisma.notification.create({
      data: {
        userId: sellerId,
        type: NotificationType.SOLD,
        message: '등록하신 포토카드가 판매되었습니다.',
        isRead: false,
      },
    });
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
