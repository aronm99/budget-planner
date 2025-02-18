<template>
  <v-form @submit.prevent="submitForm" v-if="!isSubmitted">
    <v-sheet
      border
      rounded
      elevation="5"
      class="pa-4"
    >
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
              <v-col v-for="standardHeader in standardHeaders" :key="standardHeader.value">
                <div class="mb-2">{{ standardHeader.label }}</div>
                <v-select
                  v-model="headerMapping[standardHeader.value]"
                  :items="csvHeaders"
                  label="Select matching column"
                  item-title="label"
                  item-value="value"
                  :required="standardHeader.value === 'description' || standardHeader.value === 'amount' || standardHeader.value === 'date'"
                  clearable
                  density="comfortable"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row class="mt-6" justify="end">
          <v-col cols="auto">
            <v-btn type="submit" color="primary">Submit</v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>
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
      <v-sheet
        border
        rounded
        elevation="5"
      >
        <v-table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Sub Category</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Type</th>
              <th/>
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
              <td>
                <v-tooltip :text="transaction.rawData">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-information"
                      variant="plain"
                      size="x-small"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip text="Delete Transaction">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-delete"
                      variant="plain"
                      size="x-small"
                      @click="deleteTransaction(index)"
                    />
                  </template>
                </v-tooltip>
                <v-tooltip text="Reset Transaction">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon="mdi-refresh"
                      variant="plain"
                      size="x-small"
                      @click="resetTransaction(index)"
                    />
                  </template>
                </v-tooltip>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-sheet>
      <v-row class="mt-6" justify="end">
        <v-col cols="auto">
          <v-tooltip text="Reset All Transactions">
            <template v-slot:activator="{ props }">
              <v-btn 
                v-bind="props"
                color="error" 
                icon="mdi-refresh"
                variant="tonal"
                :disabled="Object.keys(updatedTransactions).length === 0"
                size="small"
                height="40"
                rounded="lg"
                @click="resetTransactions"
              />
            </template>
          </v-tooltip>
        </v-col>
        <v-col cols="auto">
          <v-btn 
            color="primary" 
            :disabled="Object.keys(updatedTransactions).length === 0"
            size="small"
            height="40"
            rounded="lg"
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
  import { ref } from 'vue';
  import { reduce, isEqual } from 'lodash';

  import type { StatementResponse, TransactionItem } from '~/types/transaction';
  import { categories, categoryObject } from '~/lib/categories';

  const statementType = ref<'credit-card' | 'bank'>('credit-card');
  const transactionFile = ref<File | null>(null);
  const transactionFileContent = ref<string[][]>([]);
  const transactions = ref<TransactionItem[]>([]);
  const csvHeaders = ref<{ label: string, value: number }[]>([]);
  const headerMapping = ref<Record<string, number>>({});
  const isSubmitted = ref(false);
  const updatedTransactions = ref<Record<number, TransactionItem>>(transactions.value.map((transaction) => ({
    ...transaction,
    completedAt: transaction.completedAt.toString().split('T')[0],
  })));

  const standardHeaders = [
    { label: 'Transaction Date', value: 'date', tag: 'date' },
    { label: 'Description', value: 'description', tag: 'description' },
    { label: 'Amount', value: 'amount', tag: 'amount' },
    { label: 'Type', value: 'transactionType', tag: 'type' },
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

    for (const header of standardHeaders) {
      for (const csvHeader of csvHeaders.value) {
        if (csvHeader.label.toLowerCase().includes(header.tag)) {
          headerMapping.value[header.value] = csvHeader.value;
          break;
        }
      }
    }
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
      const updates = reduce(updatedTransactions.value, (acc, transaction, index) => {
        if (!isEqual(transaction, transactions.value[Number(index)])) {
          acc.push({
            ...transaction,
            completedAt: new Date(transaction.completedAt)
          });
        }
        return acc;
      }, [] as TransactionItem[]);

      const deletedTransactionIds = transactions.value.filter((_, index) => !updatedTransactions.value[index]).map((transaction) => transaction.id);

      await $fetch('api/transaction/statementUpdate', {
        method: 'POST',
        body: { updates, deletedTransactionIds }
      });

      // Clear the updates after successful save
      updatedTransactions.value = {};
      navigateTo('/');
    } catch (error) {
      console.error('Failed to save changes:', error);
      // Handle error appropriately
    }
  };

  const deleteTransaction = (index: number) => {
    delete updatedTransactions.value[index];
  }

  const resetTransaction = (index: number) => {
    updatedTransactions.value[index] = {
      ...transactions.value[index],
      completedAt: transactions.value[index].completedAt.toString().split('T')[0],
    }
  }
  const resetTransactions = () => {
    updatedTransactions.value = transactions.value.map((transaction) => ({
      ...transaction,
      completedAt: transaction.completedAt.toString().split('T')[0],
    }));
  }
</script>

<style scoped>
:deep(.v-container) {
  max-width: 100%;
}
:deep(td) {
  padding: 2px 5px;
}

:deep(.v-text-field input) {
  min-height: 0;
}

.modified-cell {
  background-color: rgba(255, 200, 0, 0.1);
}

.danger-modified-cell {
  background-color: rgba(255, 0, 0, 0.1);
}
</style>

