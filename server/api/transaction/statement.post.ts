import { PrismaClient, Transactions } from "@prisma/client";
import { ulid } from "ulid";

import { categories, categoryObject } from "~/lib/categories";
import { chatCompletion } from "~/server/utils/llm";
import { StatementResponse, TransactionItem } from "~/types/transaction";
import { getTavilyClient } from "~/server/utils/search";

const prisma = new PrismaClient();



export default defineEventHandler<Request, Promise<StatementResponse>>(async (event) => {
	if (!event.context.user) {
    throw createError({
      message: "Unauthorized",
      statusCode: 401
    });
  }

	const { transactions, statementType, headerMapping } = await readBody<{
		transactions: string[][]; // CSV string content
		statementType: 'credit-card' | 'bank';
		headerMapping: Record<string, number>;
	}>(event);

  const headings = transactions[0];

  const transactionItems: TransactionItem[] = await Promise.all(transactions.slice(1).filter((t) => t.length > 0).map(async (transaction) => {
    const id = `TRANS-${ulid()}`;

    const description = transaction[headerMapping['description']];

    const amount = Number(transaction[headerMapping['amount']]);

    const dateString = transaction[headerMapping['date']];

    const isIncome = statementType === 'credit-card' ? amount < 0 : amount > 0;

    const year = parseInt(dateString.substring(0, 4));
    const month = parseInt(dateString.substring(4, 6)) - 1;
    const date = parseInt(dateString.substring(6, 8));

    const { name: transactionName, location: transactionLocation } = await chatCompletion(
      `# Transaction Description
      ${description}
      `,
      `You are a helpful assistant that can analyze a ${statementType} transaction description.

First, think through the following steps:
1. Identify any business or merchant names in the description
2. Look for location indicators (city, state, or address)
3. Separate the core transaction name from any additional details

After your analysis, provide your response in the specified JSON format.`,
      [],
      {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'The name of the transaction'
          },
          location: {
            type: 'string',
            description: 'The location of the transaction, if no location was provided, return an empty string'
          },
        },
        required: ['name', 'location']
      }
    ) as { name: string, location: string };

    const results = await getTavilyClient().search( 
      `What is the transaction ${transactionName} in ${transactionLocation} and what do they do?`,
      {
        includeAnswer: true
      }
    );

    console.log(transaction[0], 'results',  results);

    const { name } = await chatCompletion(
      `# Transaction Description
${results.answer}

# Search Results
\`\`\`json
${JSON.stringify(results.results, null, 2).replace(/\n/g, '\n  ')}
\`\`\`
      `,
      `You are a helpful assistant that can analyze search results to identify the institution for a transaction.

Think through these steps:
1. Review the search results for mentions of company or business names
2. Identify the primary institution involved in the transaction
3. Standardize the institution name (remove legal entities like Inc., LLC, etc.)

After your analysis, provide your response in the specified JSON format.`,
      [],
      {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'The name of the institution that the transaction belongs to' }
        },
        required: ['name']
      }
    ) as { name: string };

    console.log(transaction[0], 'name', name);
    
    const { category } = await chatCompletion(
      `# Transaction Description
${results.answer}

# Search Results
\`\`\`json
${JSON.stringify(results.results, null, 2).replace(/\n/g, '\n  ')}
\`\`\`
      `,
      `You are a helpful assistant that can categorize transactions based on search results.

Think through these steps:
1. Analyze the business type and services offered
2. Consider the typical purpose of transactions with this merchant
3. Match the transaction purpose to the most appropriate category

Available categories:
${categories.map((c) => `  - ${c}`).join('\n')}

After your analysis, provide your response in the specified JSON format.`,
      [],
      {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: categories,
            description: 'The category of the transaction' }
        },
        required: ['category']
      }
    ) as { category: string };

    console.log(transaction[0], 'category', category);
    
    const { subCategory } = await chatCompletion(
      `# Transaction Description
${results.answer}

# Search Results
\`\`\`json
${JSON.stringify(results.results, null, 2).replace(/\n/g, '\n  ')}
\`\`\`
      `,
      `You are a helpful assistant that can take the search results for a transaction description and extract the sub-category of the transaction. Below are the possible sub-categories:
# Transaction Category
${category}
# Transaction Sub-Categories
${categoryObject[category].subCategories.map((c) => `  - ${c}`).join('\n')}`,
      [],
      {
        type: 'object',
        properties: {
          subCategory: {
            type: 'string',
            enum: categoryObject[category].subCategories,
            description: 'The sub-category of the transaction based on the search results' }
        },
        required: ['subCategory']
      }
    ) as { subCategory: string };

    console.log(transaction[0], 'subCategory', subCategory);
    
    return {
      id,
      userPId: event.context.user.id,
      rawData: transaction.join(','),
      name,
      category,
      subCategory,
      amount: Math.abs(amount),
      isIncome,
      completedAt: new Date(year, month, date),
    }
  }));

  return {
    success: true,
    transactions: {
      count: transactionItems.length,
      items: transactionItems
    }
  };
});
