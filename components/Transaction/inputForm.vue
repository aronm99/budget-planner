<template>
  <v-form @submit.prevent="submitForm">
    <v-container>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="formData.name" label="Name" required></v-text-field>
          <v-select
          label="Category"
          v-model="formData.category"
          :items="categories"
          required
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="formData.transactionAmount" label="Transaction Amount" required type="number" :rules="transactionAmountValidation"></v-text-field>
          <v-select
            label="Sub Category"
            v-model="formData.subCategory"
            :items="categoryObject[formData.category]?.subCategories"
            required
          ></v-select>
        </v-col>
      </v-row>
      <v-row >
        <v-col>
          <v-date-picker v-model="formData.completedDate" width="500px" height="500px" label="Select Date"></v-date-picker>
        </v-col>
        <v-col>
          <v-checkbox v-model="formData.isIncome" label="Is Income"></v-checkbox>
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
  import { categories, categoryObject } from '~/lib/categories';

  const formData = ref({
    name: '',
    category: '',
    subCategory: '',
    isIncome: false,
    completedDate: undefined,
    transactionAmount: '0',
  });

  const transactionAmountValidation = [
    (v: number | string) => {
      const floatValue = parseFloat(v as string);
      return !isNaN(floatValue) && floatValue > 0;
    }
  ]


  const submitForm = () => {
    // Handle form submission, e.g., send data to the server
    const transation = $fetch('api/transaction/single', {
      method: 'POST',
      body: {
        name: formData.value.name,
        category: formData.value.category,
        completedDate: formData.value.completedDate,
        transactionAmount: parseFloat(formData.value.transactionAmount),
      }
    });

  };
</script>
