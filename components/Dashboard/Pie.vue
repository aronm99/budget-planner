
<template>
  <v-card class="mt-6 ml-6 mr-6">
    <v-card-text>
      <div class="text-h5">
        Expense Breakdown
      </div>
      <Doughnut class="chart" ref="pieChart" :data="chartData" :options="chartOptions" />
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
    import { ref } from 'vue';
  import { useRouter } from 'vue-router';

  import { useTheme } from 'vuetify';

  import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
  import type { ChartEvent, ActiveElement } from 'chart.js';

  import { Doughnut } from 'vue-chartjs'

  import colors from '~/lib/colors';
  import { categories } from '~/lib/categories';
  
  // the index of the section currently showing, default to 0
  const sectionIndex = ref(-1);

  // the refs for the mutable chart data
  const bgColor = ref(colors.multiColor);
  const offset = ref(new Array(categories.length).fill(0));
  const chartData = ref<number[]>([]);

  // when a section of the chart is clicked set the section index to the section selected
  const onChartClick = (event: ChartEvent, activeElement: ActiveElement[]) => {
    if (sectionIndex.value === activeElement[0].index) {
      sectionIndex.value = -1;
      return;
    }
    sectionIndex.value = activeElement[0].index;    
  }

  export default {
    components: { Doughnut },
    setup() {
      const router = useRouter();
      const theme = useTheme();
      
      $fetch('api/transaction/summary', { method: 'GET'}).then((res: unknown) => {
        const resData = res as { [key: string]: number };
        const data: number[] = [];
        for (const category of categories) {
          data.push(resData[category] ?? 0);
        }
        chartData.value = data;
      });


      // if in the url query params there is a section name, use that as default selected section
      if (router.currentRoute.value.query.section) sectionIndex.value = categories.findIndex((category) => category === router.currentRoute.value.query.section);

      // set the base of the chart background colours to be based on the current theme
      bgColor.value = colors.multiColor;

      // if a section is selected set the new look for the chart
      if (sectionIndex.value !== -1) {
        bgColor.value = [...theme.global.current.value.dark ? colors.multiColorDark : colors.multiColorLight];
        
        // make the currently selected section look different (more saturated colour and have an offset)
        bgColor.value[sectionIndex.value] = colors.multiColor[sectionIndex.value];
        offset.value[sectionIndex.value] = 20;
      }

    
      
      ChartJS.register(ArcElement, Tooltip, Legend);
    
      // when the selected section changes, update backgorund color, offset, and set the query params in the url to be the new section
      watch(() => sectionIndex.value, (val) => {
        // if no section is selected restore to default graph look
        if (sectionIndex.value === -1) {
          bgColor.value = colors.multiColor;
          offset.value = new Array(categories.length).fill(0);
          router.push({ query: { ...router.currentRoute.value.query, section: undefined } });
          return;
        }

        // if a section is selected grey out other section and offset the selected values 
        bgColor.value = [...theme.global.current.value.dark ? colors.multiColorDark : colors.multiColorLight];
        bgColor.value[sectionIndex.value] = colors.multiColor[sectionIndex.value];

        offset.value = new Array(categories.length).fill(0);
        offset.value[sectionIndex.value] = 20;

        router.push({ query: { ...router.currentRoute.value.query, section: categories[val] } });
      });
    
      // if the theme changes update the colour scheme of the background colors
      watch(() => theme.global.current.value.dark, (val) => {
        if (sectionIndex.value === -1) return;

        bgColor.value = [...val ? colors.multiColorDark : colors.multiColorLight];
        bgColor.value[sectionIndex.value] = colors.multiColor[sectionIndex.value];
      });

    },
    computed: {
      chartData() {
        return({
          labels: categories,
          datasets: [
            {
              backgroundColor: bgColor.value,
              hoverBackgroundColor: colors.multiColor,
              hoverOffset: 20,
              offset: offset.value,
              data: chartData.value,
            }
          ]
        })
      },
      chartOptions() {
        return {
          responsive: true,
          maintainAspectRatio: false,
          onClick: onChartClick,
        }
      },
    }
  }
</script>

<style scoped>
  .chart {
    max-height: 40dvh;
    padding-bottom: 40px;
  }
</style>