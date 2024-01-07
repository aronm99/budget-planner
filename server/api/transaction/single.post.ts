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

	const { name, category, completedDate, transactionAmount } = await readBody<{
		name: string;
    category: string;
		completedDate: Date;
    transactionAmount: number;
	}>(event);

  const transaction = await prisma.transactions.create({
    data: {
      id: `TRNS${ulid()}`,
      name,
      type: category,
      completedAt: completedDate,
      amount: transactionAmount,
      userPId: event.context.user.userPId
    },
    select: {
      id: true,
      name: true,
      type: true,
      completedAt: true,
      amount: true,
    }
  });

  return transaction;

});
