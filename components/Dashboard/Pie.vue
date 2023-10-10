
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

  import { useTheme } from 'vuetify';

  import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
  import type { Chart, ChartOptions, ChartData, ChartEvent, ActiveElement } from 'chart.js';

  import { Doughnut } from 'vue-chartjs'

  import colors from '~/lib/colors';
  import categories from '~/lib/categories';

  const router = useRouter();
  const theme = useTheme();
  const section = ref(router.currentRoute.value.query.section || categories[0]);

  const baseBgColor = ref(theme.global.current.value.dark ? colors.multiColorDark : colors.multiColorLight);

  const onChartClick = (event: ChartEvent, activeElement: ActiveElement[], chart: Chart) => {
    const index = activeElement[0].index;
    
    section.value = categories[index];

    const newBgColors = [...baseBgColor.value];
    newBgColors[index] = colors.multiColor[index];

    const newOffset = new Array(categories.length).fill(0);
    newOffset[index] = 20;
    
    chart.data.datasets[0].backgroundColor = newBgColors;
    (chart as Chart<"doughnut">).data.datasets[0].offset = newOffset;
    
    chart.update();
  }

  const backgroundColor = [...baseBgColor.value];
  const offset =  new Array(categories.length).fill(0);

  if (section.value) {
    const index = categories.findIndex((category) => category === section.value);
    backgroundColor[index] = colors.multiColor[index];
    offset[index] = 20;
  }

  const data: ChartData<"doughnut"> = {
    labels: categories,
    datasets: [
      {
        backgroundColor,
        hoverBackgroundColor: colors.multiColor,
        hoverOffset: 20,
        offset,
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
  });

  watch(() => theme.global.current.value.dark, (val) => {
    baseBgColor.value = val ? colors.multiColorDark : colors.multiColorLight;
  });
</script>

<style scoped>
  .chart {
    max-height: 40dvh;
    padding-bottom: 40px;
  }
</style>