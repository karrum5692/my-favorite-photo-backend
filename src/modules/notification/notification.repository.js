import prisma from '../../config/db.js';

async function createNotification(data) {
  return prisma.notification.create({
    data,
  });
}

async function getNotification(userId) {
  return await prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function readNotification(id, userId) {
  return await prisma.notification.updateMany({
    where: {
      id,
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

async function readAllNotification(userId) {
  return await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

async function findTradeProposalById(proposalId) {
  return prisma.tradeProposal.findUnique({
    where: {
      id: proposalId,
    },
    include: {
      proposer: {
        select: {
          nickname: true,
        },
      },
      saleListing: {
        include: {
          seller: {
            select: {
              nickname: true,
            },
          },
          photoCard: {
            include: {
              template: {
                select: {
                  grade: true,
                  title: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

async function findPurchaseById(purchaseId) {
  return prisma.purchase.findUnique({
    where: {
      id: purchaseId,
    },
    include: {
      buyer: {
        select: {
          nickname: true,
        },
      },
      saleListing: {
        include: {
          photoCard: {
            include: {
              template: {
                select: {
                  grade: true,
                  title: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

async function findSaleListingById(saleListingId) {
  return prisma.saleListing.findUnique({
    where: {
      id: saleListingId,
    },
    include: {
      photoCard: {
        include: {
          template: {
            select: {
              grade: true,
              title: true,
            },
          },
        },
      },
    },
  });
}

export default {
  getNotification,
  readNotification,
  readAllNotification,
  createNotification,
  findTradeProposalById,
  findPurchaseById,
  findSaleListingById,
};
