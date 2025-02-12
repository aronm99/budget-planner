<template>
  <v-form @submit.prevent="submitForm" v-if="!isSubmitted">
    <v-container>
      <v-row>
        <h3>Input Transactions From Bill or Statement</h3>
      </v-row>
      <v-row>
        <v-select
          v-model="statementType"
          label="Statement Type"
          :items="[
            { title: 'Credit Card', value: 'credit-card' },
            { title: 'Bank', value: 'bank' }
          ]"
          item-title="title"
          item-value="value"
        />
      </v-row>
      <v-row>
        <v-file-input
          v-model="transactionFile"
          label="Upload Statement"
          accept=".csv"
          @change="handleFileChange"
        />
      </v-row>
      <v-row v-if="csvHeaders.length > 0">
        <v-col>
          <h4>Map CSV Headers</h4>
          <v-row>
            <v-col cols="12" v-for="standardHeader in standardHeaders" :key="standardHeader.value">
              <div class="mb-2">{{ standardHeader.label }}</div>
              <v-select
                v-model="headerMapping[standardHeader.value]"
                :items="csvHeaders"
                label="Select matching column"
                item-title="label"
                item-value="value"
                required
                density="comfortable"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn type="submit" color="primary">Submit</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>

  <v-row v-if="isSubmitted && transactions.length === 0">
    <v-col>
      <v-table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Sub Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in 5" :key="n">
            <td v-for="i in 6" :key="i">
              <v-skeleton-loader type="text" />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>

  <v-row v-if="transactions.length > 0">
    <v-col>
      <v-table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Sub Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(transaction, index) in transactions" :key="transaction.id">
            <td :class="{ 'modified-cell': isFieldModified(index, 'name') }">
              <v-text-field
                v-model="updatedTransactions[index].name"
                density="compact"
                variant="plain"
                hide-details
              />
            </td>
            <td :class="{ 'modified-cell': isFieldModified(index, 'category') }">
              <v-select
                v-model="updatedTransactions[index].category"
                density="compact"
                variant="plain"
                hide-details
                :items="categories"
              />
            </td>
            <td :class="{ 'modified-cell': isFieldModified(index, 'subCategory') }">
              <v-select
                v-model="updatedTransactions[index].subCategory"
                density="compact"
                variant="plain"
                hide-details
                :items="categoryObject[updatedTransactions[index].category].subCategories"
              />
            </td>
            <td :class="{ 'danger-modified-cell': isFieldModified(index, 'amount') }">
              <v-text-field
                v-model.number="updatedTransactions[index].amount"
                density="compact"
                variant="plain"
                hide-details
                type="number"
                prefix="$"
              />
            </td>
            <td :class="{ 'danger-modified-cell': isFieldModified(index, 'completedAt') }">
              <v-text-field
                v-model="updatedTransactions[index].completedAt"
                density="compact"
                variant="plain"
                hide-details
                type="date"
              />
            </td>
            <td :class="{ 'danger-modified-cell': isFieldModified(index, 'isIncome') }">
              <v-select
                v-model="updatedTransactions[index].isIncome"
                density="compact"
                variant="plain"
                hide-details
                :items="[
                  { title: 'Income', value: true },
                  { title: 'Expense', value: false }
                ]"
                item-title="title"
                item-value="value"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-row class="mt-4">
        <v-col>
          <v-btn 
            color="primary" 
            :disabled="Object.keys(updatedTransactions).length === 0"
            @click="saveChanges"
          >
            Save Changes
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  import type { StatementResponse, TransactionItem } from '~/types/transaction';
  import { categories, categoryObject } from '~/lib/categories';
import { isEqual } from 'lodash';

  const statementType = ref<'credit-card' | 'bank'>('credit-card');
  const transactionFile = ref<File | null>(null);
  const transactionFileContent = ref<string[][]>([]);
  const transactions = ref<TransactionItem[]>([
			{
				"id": "TRANS-01JKW6CZTR7S3BNCRC19ZZCM5P",
				"userPId": "8t3nxikgmhnn5w1",
				"rawData": "1,'5191230206476583',20250113,20250114,48.34,PIONEER # 345 MARKHAM ON",
				"name": "Pioneer Money Transfer Inc., Markham, Ontario",
				"category": "Savings",
				"subCategory": "Other savings goals (e.g., vacation fund, education fund)",
				"amount": 48.34,
				"isIncome": false,
				"completedAt": "2025-01-13T05:00:00.000Z"
			},
			{
				"id": "TRANS-01JKW6CZTR9DV5XM62GTRDA54D",
				"userPId": "8t3nxikgmhnn5w1",
				"rawData": "2,'5191230206476583',20250114,20250115,-25.0,Cashback/Remises CR",
				"name": "ELI5: What is cashback and how does it work? : r/explainlikeimfive - Reddit",
				"category": "Debt Payments",
				"subCategory": "Credit card payments",
				"amount": 25,
				"isIncome": true,
				"completedAt": "2025-01-14T05:00:00.000Z"
			}
		]);
  const csvHeaders = ref<{ label: string, value: number }[]>([]);
  const headerMapping = ref<Record<string, number>>({});
  const isSubmitted = ref(true);
  const updatedTransactions = ref<Record<number, TransactionItem>>(transactions.value.map((transaction) => ({
    ...transaction,
    completedAt: transaction.completedAt.toString().split('T')[0],
  })));

  const standardHeaders = [
    { label: 'Transaction Date', value: 'date' },
    { label: 'Description', value: 'description' },
    { label: 'Amount', value: 'amount' },
    { label: 'Type', value: 'transactionType' },
    // Add any other required headers
  ];

  const handleFileChange = async () => {
    if (!transactionFile.value) return;
    const fileContent = await transactionFile.value.text();
    
    // Parse CSV headers
    const lines = fileContent.split('\n');
    let index = 0;
    let cells = lines[index].split(',');
    while (cells.length <= 1) {
      index++;
      cells = lines[index].split(',');
    }
    csvHeaders.value.push(...lines[index].trim().split(',').map((header, index) => ({ label: header, value: index })));
    transactionFileContent.value = lines.slice(index).map(line => line.trim().split(','));
  };

  const submitForm = async () => {
    if (!transactionFile.value) return;
    isSubmitted.value = true;
    
    const transactionsResult = await $fetch<StatementResponse>('api/transaction/statement', {
      method: 'POST',
      body: {
        transactions: transactionFileContent.value,
        statementType: statementType.value,
        headerMapping: headerMapping.value,
      }
    });
    transactions.value = transactionsResult.transactions.items as TransactionItem[];
    updatedTransactions.value = transactionsResult.transactions.items.map((transaction) => ({
      ...transaction,
      completedAt: new Date(transaction.completedAt).toISOString().split('T')[0]
    }));
  };

  const isFieldModified = (index: number, field: keyof TransactionItem) => {
    if (field === 'completedAt') {
      return updatedTransactions.value[index][field] !== transactions.value[index][field].toString().split('T')[0];
    }
    return updatedTransactions.value[index][field] !== transactions.value[index][field];
  };

  const saveChanges = async () => {
    try {
      const updates = Object.entries(updatedTransactions.value).map(([index, changes]) => ({
        ...changes,
        id: transactions.value[Number(index)].id,
      }));

      await $fetch('api/transaction/bulk-update', {
        method: 'PATCH',
        body: { transactions: updates }
      });

      // Clear the updates after successful save
      updatedTransactions.value = {};
    } catch (error) {
      console.error('Failed to save changes:', error);
      // Handle error appropriately
    }
  };
</script>

<style scoped>
:deep(.v-field) {
  border-radius: 0;
  padding: 0;
}
:deep(.v-text-field input) {
  min-height: 0;
  padding: 4px 8px;
}

.modified-cell {
  background-color: rgba(255, 200, 0, 0.1);
}

.danger-modified-cell {
  background-color: rgba(255, 0, 0, 0.1);
}
</style>

