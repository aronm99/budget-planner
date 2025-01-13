import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      message: "Unauthorized",
      statusCode: 401
    });
  }
  
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  const transactionSums = await prisma.transactions.groupBy({
    by: ['category'],
    _sum: {
      amount: true,
    },
    where: {
      userPId: event.context.user.pId,
      isIncome: false,
      completedAt: {
        gte: firstDayOfMonth.toISOString(),
        lte: currentDate.toISOString(),
      },
    },
  });

  const resultSum: {[category: string]: number } = {};

  transactionSums.forEach((sum) => {
    resultSum[sum.category] = sum._sum.amount ?? 0;
  });
  
  return resultSum;
});
