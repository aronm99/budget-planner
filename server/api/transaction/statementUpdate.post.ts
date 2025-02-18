import { PrismaClient } from "@prisma/client";
import type { TransactionItem } from "~/types/transaction";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  
  if (!event.context.user) {
    throw createError({
      message: "Unauthorized", 
      statusCode: 401
    });
  }
  
  const { updates, deletedTransactionIds } = await readBody<{
    updates: TransactionItem[]
    deletedTransactionIds: string[]
  }>(event);


  try {
  
    // Verify all transactions belong to the user
    const transactionIds = updates.map(t => t.id);
    const existingTransactions = await prisma.transactions.findMany({
      where: {
        id: { in: transactionIds },
        userPId: event.context.user.pId
      }
    });
  
    if (existingTransactions.length !== transactionIds.length) {
      throw createError({
        message: "One or more transactions not found or unauthorized",
        statusCode: 404
      });
    }
  
    // Bulk update transactions
    const updatedTransactions = await Promise.all([
      ...updates.map(transaction => 
        prisma.transactions.update({
          where: {
            id: transaction.id
          },
          data: {
            name: transaction.name,
            category: transaction.category,
            subCategory: transaction.subCategory,
            amount: transaction.amount,
            isIncome: transaction.isIncome,
            completedAt: new Date(transaction.completedAt),
          },
          select: {
            id: true,
            name: true,
            category: true,
            subCategory: true,
            amount: true,
            isIncome: true,
            completedAt: true,
            rawData: true
          }
        })
      ),
      ...deletedTransactionIds.map(id => 
        prisma.transactions.delete({
          where: {
            id
          }
        })
      ),
    ]);
  
    return {
      success: true,
      transactions: {
        count: updatedTransactions.length,
        items: updatedTransactions
      }
    };
  } catch (error) {
    console.error(error);
    throw createError({
      message: `Failed to update transactions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      statusCode: 500
    });
  }
});

