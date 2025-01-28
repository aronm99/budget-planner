<template>
  <v-form @submit.prevent="submitForm">
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
          :loading="loading"          accept=".csv,.txt,.pdf"
          @change="handleFileChange"
        />
      </v-row>
      <v-row>
        <v-col>
          <v-btn type="submit" color="primary">Submit</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
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
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td>{{ transaction.name }}</td>
            <td>{{ transaction.category }}</td>
            <td>{{ transaction.subCategory }}</td>
            <td>${{ transaction.amount.toFixed(2) }}</td>
            <td>{{ new Date(transaction.completedAt).toLocaleDateString() }}</td>
            <td>{{ transaction.isIncome ? 'Income' : 'Expense' }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import type { StatementResponse, TransactionItem } from '~/types/transaction';

  const statementType = ref<'credit-card' | 'bank'>('credit-card');
  const transactionFile = ref<File | null>(null);
  const transactionString = ref('');
  const loading = ref(false);
  const transactions = ref<TransactionItem[]>([]);
  const handleFileChange = async () => {
    if (!transactionFile.value) return;
    const fileContent = await transactionFile.value.text();
    transactionString.value = fileContent;
  };

  const submitForm = async () => {
    if (!transactionFile.value) return;
    loading.value = true;
    const transactionsResult = await $fetch<StatementResponse>('api/transaction/statement', {
      method: 'POST',
      body: {
        transactions: transactionString.value,
        statementType: statementType.value,
      }
    });
    transactions.value = transactionsResult.transactions.items as TransactionItem[];
    loading.value = false;
  };
</script>

