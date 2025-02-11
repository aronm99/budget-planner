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
          :loading="loading"
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
  const csvHeaders = ref<{ label: string, value: number }[]>([]);
  const headerMapping = ref<Record<string, number>>({});

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
    transactionString.value = fileContent;
    
    // Parse CSV headers
    const lines = fileContent.split('\n');
    let index = 0;
    let cells = lines[index].split(',');
    while (cells.length <= 1) {
      index++;
      cells = lines[index].split(',');
    }
    csvHeaders.value.push(...lines[index].trim().split(',').map((header, index) => ({ label: header, value: index })));
  };

  const submitForm = async () => {
    if (!transactionFile.value) return;
    loading.value = true;
    const transactionsResult = await $fetch<StatementResponse>('api/transaction/statement', {
      method: 'POST',
      body: {
        transactions: transactionString.value,
        statementType: statementType.value,
        headerMapping: headerMapping.value,
      }
    });
    transactions.value = transactionsResult.transactions.items as TransactionItem[];
    loading.value = false;
  };
</script>

