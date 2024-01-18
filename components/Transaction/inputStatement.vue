<template>
  <v-form @submit.prevent="submitForm">
    <v-container>
      <v-row>
        <h3>Input Transactions From Bill or Statement</h3>
      </v-row>
      <v-row>
        <v-textarea v-model="transactionString" label="Transactions" :loading="loading"/>
      </v-row>
      <v-row>
        <v-col>
          <v-btn type="submit" color="primary">Submit</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const transactionString = ref('');
  const loading = ref(false);


  const submitForm = async () => {
    // Handle form submission, e.g., send data to the server
    loading.value = true;
    const transactions = await $fetch('api/transaction/statement', {
      method: 'POST',
      body: {
        transactions: transactionString.value,
      }
    });
    loading.value = false;
  };
</script>
