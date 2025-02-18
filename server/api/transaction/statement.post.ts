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

  let body: {
    transactions: string[][]; // CSV string content
    statementType: 'credit-card' | 'bank';
    headerMapping: Record<string, number>;
  } | undefined;
  try {
    body = await readBody<{
      transactions: string[][]; // CSV string content
      statementType: 'credit-card' | 'bank';
      headerMapping: Record<string, number>;
    }>(event);
  } catch (error) {
    console.error(error);
    throw createError({
      message: `Failed to read body: ${error instanceof Error ? error.message : 'Unknown error'}`,
      statusCode: 400
    });
  }

  const { transactions, statementType, headerMapping } = body;

  try {
  
    const transactionItems: TransactionItem[] = await Promise.all(transactions.slice(1).filter((t) => t.length > 1).map(async (transaction) => {
      const id = `TRANS-${ulid()}`;
  
      const description = transaction[headerMapping['description']];
  
      const amount = Number(transaction[headerMapping['amount']]);
  
      const dateString = transaction[headerMapping['date']];
  
      const isIncome = statementType === 'credit-card' ? amount < 0 : amount > 0;
  
      const year = parseInt(dateString.substring(0, 4));
      const month = parseInt(dateString.substring(4, 6)) - 1;
      const date = parseInt(dateString.substring(6, 8));
  
      const { name: transactionName, location: transactionLocation } = await chatCompletion({
        prompt: `# Transaction Description
${description}
`,
        systemPrompt: `You are a helpful assistant that can analyze a ${statementType} transaction description.
  
First, think through the following steps:
1. Identify any business or merchant names in the description
2. Look for location indicators (city, state, or address)
3. Separate the core transaction name from any additional details
4. if location is not provided, return an empty string
!Important: only return the location, do not include any other text in the location field

After your analysis, provide your response in the specified JSON format.`,
        jsonSchema: {
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
        },
        modelType: 'gen'
      }) as { name: string, location: string };
  
      const results = await getSearchResults( 
        transactionLocation.length > 0 ? `What is the transaction ${transactionName} in ${transactionLocation} and what do they do?` : `What is the transaction ${transactionName} and what do they do?`,
        true
      );
  
      const { name } = await chatCompletion({
        prompt: `# Transaction Description
  ${results.answer}
  
  # Search Results
  \`\`\`json
  ${JSON.stringify(results.results, null, 2).replace(/\n/g, '\n  ')}
  \`\`\`
        `,
        systemPrompt: `You are a helpful assistant that can analyze search results to identify the institution for a transaction.
  
Think through these steps:
1. Review the search results for mentions of company or business names
2. Identify the primary institution involved in the transaction
3. Standardize the institution name (remove legal entities like Inc., LLC, etc.)

After your analysis, provide your response in the specified JSON format.`,
        jsonSchema: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'The name of the institution that the transaction belongs to' }
          },
          required: ['name']
        },
        modelType: 'gen'
    }) as { name: string };
  
    const history: { role: string, content: string }[] = [];

    const categoryReasonPrompt = `# Transaction Description
  ${results.answer}
  
  # Search Results
  \`\`\`json
  ${JSON.stringify(results.results, null, 2).replace(/\n/g, '\n  ')}
  \`\`\` `;

  history.push({ role: 'user', content: categoryReasonPrompt });

      const categoryReason = await chatCompletion({
        prompt: categoryReasonPrompt,
        systemPrompt: `You are a helpful assistant that can categorize transactions based on search results.
  
Think through these steps:
1. Analyze the business type and services offered
2. Consider the typical purpose of transactions with this merchant
3. Match the transaction purpose to the most appropriate category
4. Match the transaction purpose to the most appropriate sub-category

Available categories with possible sub-categories:
${Object.values(categoryObject).map((c) => `  - ${c.name} ${c.subCategories.map((s) => `    - ${s}`).join('\n')}`).join('\n')}

Provide your full analysis and reasoning for the category.`,
        modelType: 'reason'
      }) as string;

      history.push({ role: 'assistant', content: categoryReason });

      const categoryPrompt = 'Choose the appropriate category for the transaction based on the thought process and search results.';

      const { category } = await chatCompletion({
       prompt: categoryPrompt,
        systemPrompt: `You are a helpful assistant that can categorize transactions based on search results.
  
Think through these steps:
1. Use the the thought process to categorize the transaction

Available categories:
${categories.map((c) => `  - ${c}`).join('\n')}

After your analysis, provide your response in the specified JSON format.`,
        history,
        jsonSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: categories,
              description: 'The category of the transaction' }
          },
          required: ['category']
        },
        modelType: 'gen'
      }) as { category: string };

      history.push({ role: 'user', content: categoryPrompt }, { role: 'assistant', content: category });

      const subCategoryPrompt = 'Choose the appropriate sub-category for the transaction based on the thought process, the category and the search results.';
        
      const { subCategory } = await chatCompletion({
        prompt: subCategoryPrompt,
        systemPrompt: `You are a helpful assistant that can take the search results for a transaction description and extract the sub-category of the transaction. Below are the possible sub-categories:
# Transaction Category
${category}
# Transaction Sub-Categories
${categoryObject[category].subCategories.map((c) => `  - ${c}`).join('\n')}`,
        history,
        jsonSchema: {
          type: 'object',
          properties: {
            subCategory: {
              type: 'string',
              enum: categoryObject[category].subCategories,
              description: 'The sub-category of the transaction based on the search results' }
          },
          required: ['subCategory']
        },
        modelType: 'gen'
      }) as { subCategory: string };

      history.push({ role: 'user', content: subCategoryPrompt }, { role: 'assistant', content: subCategory });
  
      
      return {
        id,
        userPId: event.context.user.pId,
        rawData: transaction.join(','),
        name,
        category,
        subCategory,
        amount: Math.abs(amount),
        isIncome,
        completedAt: new Date(year, month, date),
      }
    }));
  
    await prisma.transactions.createMany({
      data: transactionItems,
    });
  
    return {
      success: true,
      transactions: {
        count: transactionItems.length,
        items: transactionItems
      }
    };
  } catch (error) {
    console.error(error);
    throw createError({
      message: `Failed to create transactions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      statusCode: 500
    });
  }
});
