<template>
  <v-card class="mt-6 mr-6">
    <v-card-text>
      <div class="text-h4">
        {{ sectionTitle }}
      </div>
      <v-divider class="border-opacity-100 mb-4" thickness="10" :color="color" />
      <span class="text-h6 mr-2">Total Spent</span>
      <span class="text-h6 font-weight-bold">$100</span>
      <div class="mt-2 text-h5" >Recent Transactions</div>
      <v-table>
        <tbody>
          <tr v-for="i in 5" :key="i">
            <td class="text-subtitle-1">Transaction {{ i }}</td>
            <td>$20</td>
            <td class="text-body-2 text-medium-emphasis">{{ (new Date(Date.now() - 10000*i)).toUTCString() }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
  import { ref, watch } from 'vue'
  import { useRouter } from 'vue-router';

  import categories from '~/lib/categories';
  import colors from '~/lib/colors';


  export default defineComponent({
    setup (props) {
      const router = useRouter();

      const sectionTitle = ref(router.currentRoute.value.query.section ? router.currentRoute.value.query.section as string : categories[0]);
      const sectionIndex = ref(categories.findIndex((category) => category === sectionTitle.value));
      const color = ref(colors.multiColor[sectionIndex.value]);
      
      watch(() => router.currentRoute.value.query.section, (val) => {
        sectionTitle.value = val ? val as string : categories[0];
        sectionIndex.value = categories.findIndex((category) => category === sectionTitle.value);
        color.value = colors.multiColor[sectionIndex.value];
      });

      return {
        sectionTitle,
        color,
      }
    },
  })
</script>

<style scoped>
</style>