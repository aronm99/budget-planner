<template>
  <v-form @submit.prevent="submitForm">
    <v-container>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="formData.name" label="Name" required></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="formData.category" label="Category" required></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="formData.transactionAmount" label="Transaction Amount" required type="number"></v-text-field>
        </v-col>
      </v-row>
      <v-row >
        <v-col>
          <v-date-picker v-model="formData.completedDate" width="500px" height="500px" label="Select Date"></v-date-picker>
        </v-col>
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

  const formData = ref({
    name: '',
    category: '',
    completedDate: undefined,
    transactionAmount: 0,
  });


  const submitForm = () => {
    // Handle form submission, e.g., send data to the server
    console.log('Form submitted:', formData.value);
    const transation = $fetch('api/transaction/single', {
      method: 'POST',
      body: formData.value,
    });

  };
</script>
