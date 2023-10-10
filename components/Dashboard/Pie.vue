
import { ChartsDoughnut } from '#build/components';
<template>
  <v-card class="mt-6 ml-6 mr-6">
    <v-card-text>
      <div class="text-h5">
        Expense Breakdown
      </div>
      <Doughnut class="chart" :data="data" :options="options" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';

  import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
  import type { Chart, ChartOptions, ChartData, ChartEvent, ActiveElement } from 'chart.js';

  import { merge } from 'lodash';

  import { Doughnut } from 'vue-chartjs'

  import colors from '~/lib/colors';
  import categories from '~/lib/categories';

  const router = useRouter();
  const section = ref(router.currentRoute.value.query.section || categories[0]);

  const onChartClick = (event: ChartEvent, activeElement: ActiveElement[], chart: Chart) => {
    section.value = categories[activeElement[0].index];
  }

  const data: ChartData<"doughnut"> = {
    labels: categories,
    datasets: [
      {
        backgroundColor: colors.multiColor,
        data: [40, 20, 80, 10, 45, 65, 45]
      }
    ]
  }

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: onChartClick,
  }

  ChartJS.register(ArcElement, Tooltip, Legend)

  watch(() => section.value, (val) => {
    const currentQuery = router.currentRoute.value.query;
    router.push({ query: { ...router.currentRoute.value.query, section: val } });
    console.log('watch', val);
  });
</script>

<style scoped>
  .chart {
    max-height: 40dvh;
    width: 100%
  }
</style>