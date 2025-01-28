import { PrismaClient } from "@prisma/client";
import { ulid } from "ulid";
import { categories, categoryObject } from "~/lib/categories";
import { chatCompletion } from "~/server/utils/llm";
import { StatementResponse } from "~/types/transaction";
const prisma = new PrismaClient();

const systemPrompt = `You are a financial budgeting agent and need to extract transactions from the provided credit card or bank statement
For each transaction follow the following steps:
# Steps
  1. Extract the name directly from the statement, DO NOT simplify the name 
  2. Extract the amount directly from the statement, DO NOT simplify the amount 
  3. extract the date directly from the statement
  4. if the transaction is a credit card payment ignore it and return null for the name, amount, and date 
  5. using the list of categories provided in the <Categories> tag, select the category that matches the transaction, make sure the category exists in the list 
  6. in the object of categories and subcategories provided in the <CategoryObject> tag, get the values where the key matches the category selected in step 2 
  7. from the list of subcategories found in step 3, select the subcategory that matches the transaction 
  8. if the transaction is an income or expense, set the isIncome property to true or false 
  9. return the transaction object with the name, category, subCategory, isIncome, completedAt, and amount properties 

## Categories
\`\`\`json
  [${Object.keys(categories).join(", ")}]
\`\`\`

## SubCategory Object
\`\`\`json
  ${JSON.stringify(categoryObject, null, 2).replace(/\\n/g, "\\n  ")}
\`\`\`
`

const jsonSchema = {
  title: "transaction",
  description: "The transaction object",
  type: "object",
  properties: {
    name: {
      description: "The name of the transaction, also can be the full store name for the transaction",
      type: "string"
    },
    category: { 
      type: "string",
      enum: categories,
      description: "The category of the transaction, must be one of the predefined categories."
    },
    subCategory: {
      type: "string",
      description: "The subcategory of the transaction, must be a valid subcategory for the selected category."
    },
    isIncome: {
      type: "boolean",
      description: "Whether the transaction is an income or expense."
    },
    completedAt: { 
      type: "string",
      format: "date-time",
      description: "The date of the transaction in ISO 8601 format"
    },
    amount: { 
      type: "number",
      description: "The amount of the transaction as a float"
    }
  },
  required: ["name", "category", "subCategory", "isIncome", "completedAt", "amount"]
};

const name = 'categorized-transactions'


export default defineEventHandler<Request, Promise<StatementResponse>>(async (event) => {
	if (!event.context.user) {
    throw createError({
      message: "Unauthorized",
      statusCode: 401
    });
  }

	const { transactions, statementType } = await readBody<{
		transactions: string; // CSV string content
		statementType: 'credit-card' | 'bank';
	}>(event);

	// Split CSV into rows and handle headers
	const transactionRows = transactions
		.split('\n')
		.map(row => row.trim().split(','))
		.filter(row => row.length > 2);

	// Extract headers and data rows
	const headers = transactionRows[0].map(header => header.trim());
	const dataRows = transactionRows.slice(1);

  let amountIndex: number = -1;
  let nameIndex: number = -1;


  let headerPrompt = `You are a financial budgeting agent and need to interpret the headers of the provided credit card or bank statement. 
You are provided with the headers of the CSV file and need to find the header name for the name and amount. 
Note: Sometimes the name is under the column 'description' or 'name'.

## Headers
  ${headers.map(header => `  - ${header}`).join('\n')}


## Example
\`\`\`json
  {
    "amountHeader": "Transaction Amount",
    "nameHeader": "Description"
  }
\`\`\`
`;
  console.log('headerPrompt', headerPrompt);

  const headerJsonSchema = {
    title: "headers",
    description: "The headers object containing the amount and name column headers from the statement CSV headers",
    type: "object",
    properties: {
      amountHeader: {
        type: "string",
        enum: headers,
        description: "The header name of the transaction amount column, must be one of the headers provided"
      },
      nameHeader: {
        type: "string",
        enum: headers,
        description: "The header name of the transaction name column, must be one of the headers provided"
      },
    },
    required: ["amountHeader", "nameHeader"]
  }

  let result = await chatCompletion(headerPrompt, undefined, undefined, headerJsonSchema, 'header-extraction') as {
    amountHeader: string;
    nameHeader: string;
  };

  console.log('result', result, typeof result, 'amountHeader', result.amountHeader, 'nameHeader', result.nameHeader);

  amountIndex = headers.indexOf(result.amountHeader);
  nameIndex = headers.indexOf(result.nameHeader);

  while (amountIndex === -1 || nameIndex === -1) {
     const history = [{
      role: "user",
      content: headerPrompt
    }, {
      role: "assistant",
      content: JSON.stringify(result)
    }];

    console.log('history', JSON.stringify(history, null, 2));

    headerPrompt = `There were errors in the previous response.
${amountIndex === -1 ? `ERROR: the column header for the amount, ${result.amountHeader}, was not found\n` : ""}${nameIndex === -1 ? `ERROR: the column header for the name, ${result.nameHeader}, was not found\n` : ""}

Reminder the headers are:
## Headers
${headers.map(header => `  - ${header}`).join('\n')}`;

    console.log('headerPrompt', headerPrompt);

    result = await chatCompletion(headerPrompt, undefined, history, headerJsonSchema, name) as {
      amountHeader: string;
      nameHeader: string;
    };

    console.log('result', result, typeof result, 'amountHeader', result.amountHeader, 'nameHeader', result.nameHeader);

    amountIndex = headers.indexOf(result.amountHeader);
    nameIndex = headers.indexOf(result.nameHeader);
    console.log('amountIndex', amountIndex);
    console.log('nameIndex', nameIndex);
  }


	const promiseResults = await Promise.all(
		dataRows.map(async (row) => {
			// Create an object mapping headers to values
			const rowData = row.reduce((acc, val, index) => {
				acc[headers[index]] = val.trim();
				return acc;
			}, {} as Record<string, string>);

			const formattedRow = JSON.stringify(rowData, null, 2);

			const prompt = statementType === 'credit-card' 
				? `The credit card transaction with headers is provided below:\n## Credit Card Statement\n\`\`\`json\n  ${formattedRow.replace(/\\n/g, "\\n  ")}\n\`\`\``
				: `The bank transaction with headers is provided below:\n## Bank Statement\n\`\`\`json\n  ${formattedRow.replace(/\\n/g, "\\n  ")}\n\`\`\``;

			const result = await chatCompletion(prompt, systemPrompt, undefined, jsonSchema, name) as {
        name: string;
        category: string;
        subCategory: string;
        isIncome: boolean;
        completedAt: string;
        amount: number;
      };

      if (!result.name || !result.category || !result.subCategory || !result.isIncome || !result.completedAt || !result.amount) {
        return null;
      }

			console.log(result);
			return {
        name: rowData[nameIndex],
        category: result.category,
        subCategory: result.subCategory,
        isIncome: result.isIncome,
        completedAt: result.completedAt,
        amount: parseFloat(rowData[amountIndex]),
        rawData: formattedRow
      };
		})
	);

  const transactionsResults = promiseResults.filter(result => result !== null);
	const transactionInput = [];

	const failedTransactions = [];

	for (const transResult of transactionsResults) {
		const { name, category, subCategory, isIncome, completedAt, amount, rawData } = transResult;

		const completedDate = new Date(completedAt);

		if (!categories.includes(category)) {
			failedTransactions.push(transResult);
			continue;
		}

		if (!categoryObject[category].subCategories.includes(subCategory)) {
			failedTransactions.push(transResult);
			continue;
		}

		transactionInput.push({
			id: `TRNS${ulid()}`,
			name,
			category,
			subCategory,
			amount,
			isIncome,
			completedAt: completedDate,
      rawData,
			userPId: event.context.user.pId
		});
	}

	try {
		const transaction = await prisma.transactions.createMany({
			data: transactionInput,
		});

		return {
			success: true,
			transactions: {
				count: transaction.count,
				items: transactionInput
			},
			failedTransactions: {
				count: failedTransactions.length,
				items: failedTransactions
			}
		};
	} catch (error) {
		console.error('Error creating transactions:', error);
		throw createError({
			message: 'Failed to create transactions',
			statusCode: 500,
			cause: error
		});
	}
});
