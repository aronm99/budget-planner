import { PrismaClient } from "@prisma/client";
import { ulid } from "ulid";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
	if (!event.context.user) {
    throw createError({
      message: "Unauthorized",
      statusCode: 401
    });
  }

	const { name, category, subCategory, isIncome, completedDate, transactionAmount } = await readBody<{
		name: string;
    category: string;
    subCategory?: string;
    isIncome: boolean;
		completedDate: Date;
    transactionAmount: number;
	}>(event);

  const transaction = await prisma.transactions.create({
    data: {
      id: `TRNS${ulid()}`,
      name,
      category,
      subCategory,
      isIncome,
      completedAt: completedDate,
      amount: transactionAmount,
      userPId: event.context.user.pId
    },
    select: {
      id: true,
      name: true,
      category: true,
      subCategory: true,
      completedAt: true,
      amount: true,
    }
  });

  return transaction;

});
