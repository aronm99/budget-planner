import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    throw createError({
      message: "Unauthorized",
      statusCode: 401
    });
  }
  
  const query = getQuery(event);

  const type = !query.type || query.type === "All" ? undefined : query.type as string;

  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  const transactions = await prisma.$transaction([
    prisma.transactions.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        userPId: event.context.user.pId,
        type,
        completedAt: {
          gte: firstDayOfMonth.toISOString(),
          lte: currentDate.toISOString(),
        },
      },
    }),
    prisma.transactions.findMany({
      where: {
        userPId: event.context.user.pId,
        type,
        completedAt: {
          gte: firstDayOfMonth.toISOString(),
          lte: currentDate.toISOString(),
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        completedAt: true,
        amount: true,
      },
      orderBy: {
        completedAt: "desc",
      },
      take: 5,
    }),
  ]);

  return {
    sum: transactions[0]._sum.amount ?? 0,
    transactions: transactions[1],
  };
});
