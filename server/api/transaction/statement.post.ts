import { PrismaClient } from "@prisma/client";
import { ulid } from "ulid";
import { categories, categoryObject } from "~/lib/categories";
import { chatCompletion } from "~/server/utils/openAi";

const prisma = new PrismaClient();

const jsonFormat = `
  {
    "name": string,
    "category": ${categories.join(" | ")}},
    "subCategory": string,
    "isIncome": boolean,
    "completedAt": string (ISO 8601 date),
    "amount": float,
  }
`;


const categoriesListString = `[${Object.keys(categories).join(", ")}]`;
const categoryAndSubListing = JSON.stringify(categoryObject, null, 2);

export default defineEventHandler(async (event) => {
	if (!event.context.user) {
    throw createError({
      message: "Unauthorized",
      statusCode: 401
    });
  }

	const { transactions } = await readBody<{
		transactions: string;
	}>(event);

  const prompt = `
You are a financial budgeting agent and need to extract transactions from the provided credit card statement /
For each transaction follow the following steps: /
1. extract the name, amount, date, and if the transaction is an income or expense /
if the transaction is a credit card payment or transfer, ignore it and move on to the next transaction /
2. using the list of categories provided in the triple tildas, select the category that matches the transaction, make sure the vateogy exists in the list /
3. in the object of categories and subcategories provided in the triple parenthesis get the values where the key matches the category selected in step 2 /
4. from the list of subcategories found in step 3, select the subcategory that matches the transaction /
5. put all the information in the JSON object provided in the triple back tick making sure the output is a JSON string /
Once the objects are created, put them in a list surrounded in square brackets /
\`\`\`${jsonFormat}\`\`\`
~~~${categoriesListString}~~~
(((${categoryAndSubListing})))
the creditcard statement is provided in the triple quotes below:
'''${transactions}'''`

  const results = await chatCompletion(prompt);

  if (!results) {
    throw createError({
      message: "Unable to parse transactions",
      statusCode: 400
    });
  }
  const transactionsResults = JSON.parse(results) as { name: string; category: string; subCategory: string; isIncome: boolean; completedAt: string; amount: number }[];

  const transactionInput = [];

  const failedTransactions = [];

  for (const transResult of transactionsResults) {
    const { name, category, subCategory, isIncome, completedAt, amount } = transResult;

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
      userPId: event.context.user.pId
    });
  }

  const transaction = await prisma.transactions.createMany({
    data: transactionInput,
  });

  return {
    transactions: transaction,
    failedTransactions
  };

});
