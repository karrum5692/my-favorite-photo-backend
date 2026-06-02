import {
  PrismaClient,
  Grade,
  Genre,
  PhotoCardStatus,
  SaleStatus,
  ProposalStatus,
  PointType,
  NotificationType,
} from '@prisma/client';

import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// =====================
// RAW DATA
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
];

const RAW_TEMPLATES = [
  {
    seq: 1,
    userSeq: 2,
    name: '빌리 문수아 콘서트',
    description: '콘서트 포카',
    genre: Genre.CONCERT,
    grade: Grade.COMMON,
    price: 8000,
    totalQuantity: 3,
    imageUrl: 'https://picsum.photos/360/270?random=10',
  },
  {
    seq: 2,
    userSeq: 3,
    name: 'NCT 유우시 특전',
    description: '특전 포카',
    genre: Genre.SPECIAL,
    grade: Grade.SUPER_RARE,
    price: 22000,
    totalQuantity: 1,
    imageUrl: 'https://picsum.photos/360/270?random=11',
  },
];

const PHOTO_CARD_MAP = [
  { templateSeq: 1, ownerSeq: 2, quantity: 2, status: PhotoCardStatus.ON_SALE },
  { templateSeq: 1, ownerSeq: 3, quantity: 1, status: PhotoCardStatus.OWNED },
  { templateSeq: 2, ownerSeq: 3, quantity: 1, status: PhotoCardStatus.OWNED },
];

const SALE_LISTINGS = [
  { templateSeq: 1, sellerSeq: 2, quantity: 2, price: 8000 },
  { templateSeq: 2, sellerSeq: 3, quantity: 1, price: 22000 },
];

// =====================
// MAIN
// =====================

async function main() {
  console.log('🌱 SEED START');

  const userMap = new Map();
  const templateMap = new Map();
  const photoCardMap = new Map();
  const saleListingIds = [];

  // =====================
  // 1. USERS
  // =====================
  console.log('👤 USERS');

  for (const u of RAW_USERS) {
    const hashed = await bcrypt.hash(u.password, 10);

    const user = await prisma.user.create({
      data: {
        email: u.email,
        password: hashed,
        nickname: u.nickname,
      },
    });

    userMap.set(u.seq, user.id);
  }

  // =====================
  // 2. POINTS
  // =====================
  console.log('💰 POINTS');

  for (const u of RAW_USERS) {
    await prisma.point.create({
      data: {
        user: { connect: { id: userMap.get(u.seq) } },
        balance: u.points,
      },
    });
  }

  // =====================
  // 3. TEMPLATES
  // =====================
  console.log('🃏 TEMPLATES');

  for (const t of RAW_TEMPLATES) {
    const creatorId = userMap.get(t.userSeq);

    const template = await prisma.cardTemplate.create({
      data: {
        creator: { connect: { id: creatorId } },
        title: t.name,
        description: t.description,
        imageUrl: t.imageUrl,
        grade: t.grade,
        genre: t.genre,
        price: t.price,
        totalIssued: t.totalQuantity,
      },
    });

    templateMap.set(t.seq, template.id);
  }

  // =====================
  // 4. PHOTO CARDS
  // =====================
  console.log('📸 PHOTO CARDS');

  for (const pc of PHOTO_CARD_MAP) {
    const templateId = templateMap.get(pc.templateSeq);
    const ownerId = userMap.get(pc.ownerSeq);

    const card = await prisma.photoCard.create({
      data: {
        template: { connect: { id: templateId } },
        owner: { connect: { id: ownerId } },
        quantity: pc.quantity,
        status: pc.status,
      },
    });

    photoCardMap.set(`${pc.templateSeq}-${pc.ownerSeq}`, card.id);
  }

  // =====================
  // 5. SALE LISTINGS
  // =====================
  console.log('🏪 SALE LISTINGS');

  for (const sl of SALE_LISTINGS) {
    const sellerId = userMap.get(sl.sellerSeq);
    const photoCardId = photoCardMap.get(`${sl.templateSeq}-${sl.sellerSeq}`);

    const listing = await prisma.saleListing.create({
      data: {
        seller: { connect: { id: sellerId } },
        photoCard: { connect: { id: photoCardId } },
        quantity: sl.quantity,
        remainQuantity: sl.quantity,
        price: sl.price,
        status: SaleStatus.SELLING,
      },
    });

    saleListingIds.push(listing.id);
  }

  console.log('✅ SEED DONE');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
