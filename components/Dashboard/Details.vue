<template>
  <v-card class="mt-6 mr-6">
    <v-card-text>
      <div class="text-h4">
        {{ sectionTitle }}
      </div>
      <v-divider class="border-opacity-100 mb-4" thickness="10" :color="color" />
      <span class="text-h6 mr-2">Total Spent</span>
      <span class="text-h6 font-weight-bold">${{ totalSum.toFixed(2) }}</span>
      <div class="mt-2 text-h5" >Recent Transactions</div>
      <v-data-table
        :headers="headers"
        :items="transactions"
        :loading="loading"
        :no-data-text="loading ? '' : 'No transactions'"
        :no-results-text="loading ? '' : 'No transactions'"
        :items-per-page="5"
      />
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
  import { ref, watch } from 'vue'
  import { useRouter } from 'vue-router';

  import { categories } from '~/lib/categories';
  import colors from '~/lib/colors';


  const headers = [
    { text: 'Name', key:'name', value: 'name' },
    { text: 'Sub Category', key: 'subCategory', value: 'subCategory'},
    { text: 'Amount', key:'amount', value: (value: { id: number, name: string, category: string, subCategory?: string, completedAt: string, amount: number }) => `$${value.amount.toFixed(2)}` },
    { text: 'Date', key:'date', value: (value: { id: number, name: string, category: string, subCategory?: string, completedAt: string, amount: number }) => (new Date(value.completedAt)).toDateString() },
  ]

  export default defineComponent({
    setup (props) {
      const router = useRouter();

      const loading = ref(true);
      const totalSum = ref(0);
      const transactions = ref<{ id: number, name: string, category: string, subCategory: string, completedAt: Date, amount: number }[]>([]); 

      const sectionTitle = ref(router.currentRoute.value.query.section ? router.currentRoute.value.query.section as string : "All");
      const sectionIndex = ref(categories.findIndex((category) => category === sectionTitle.value));
      const color = ref(colors.multiColor[sectionIndex.value]);
      
      $fetch('api/transaction/many', { method: 'GET', query: { category: sectionTitle.value }}).then((res: unknown) => {
        const resData = res as { sum: number, transactions: { id: number, name: string, category: string, subCategory: string; completedAt: Date, amount: number }[] };
        totalSum.value = resData.sum;
        transactions.value = resData.transactions;
        loading.value = false;
      });
      
      watch(() => router.currentRoute.value.query.section, (val) => {
        sectionTitle.value = val ? val as string : "All";
        sectionIndex.value = categories.findIndex((category) => category === sectionTitle.value);
        color.value = colors.multiColor[sectionIndex.value];
        loading.value = true;
        $fetch('api/transaction/many', { method: 'GET', query: { category: sectionTitle.value }}).then((res: unknown) => {
          const resData = res as { sum: number, transactions: { id: number, name: string, category: string, subCategory: string; completedAt: Date, amount: number }[] };
          totalSum.value = resData.sum;
          transactions.value = resData.transactions;
          loading.value = false;
        });
      });

      return {
        sectionTitle,
        totalSum,
        transactions,
        loading,
        headers: headers as any,
        color,
      }
    },
  })
</script>

<style scoped>
</style>