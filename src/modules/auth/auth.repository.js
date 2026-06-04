import prisma from '../../config/db.js';

async function findById(id) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

async function findByEmail(email) {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
}

async function create(user) {
  return prisma.user.create({
    data: {
      email: user.email,
      nickname: user.nickname,
      password: user.password,
    },
  });
}

async function update(id, data) {
  return prisma.user.update({
    where: {
      id,
    },
    data: data,
  });
}

async function createOrUpdate(provider, providerId, email, nickname) {
  return prisma.user.upsert({
    where: { provider, providerId },
    update: { email, nickname },
    create: { provider, providerId, email, nickname },
  });
}

async function findRefreshTokenByUserId(userId) {
  return prisma.refreshToken.findUnique({
    where: {
      userId,
    },
  });
}

async function updateRefreshToken(userId, token) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return prisma.refreshToken.upsert({
    where: {
      userId,
    },
    update: {
      token,
      expiresAt,
    },
    create: {
      userId,
      token,
      expiresAt,
    },
  });
}

async function deleteRefreshToken(token) {
  return prisma.refreshToken.deleteMany({
    where: {
      token,
    },
  });
}

export default {
  findById,
  findByEmail,
  create,
  update,
  createOrUpdate,
  deleteRefreshToken,
  updateRefreshToken,
  findRefreshTokenByUserId,
};
