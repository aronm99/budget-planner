
<template>
  <v-row>
    <v-col class="pa-0">
      <DashboardPie />
    </v-col>
    <v-col class="pa-0">
      <DashboardDetails />
    </v-col>
  </v-row>
</template>
  
<script lang="ts">
import { defineComponent, ref } from 'vue'


export default defineComponent({
  setup () {
    const sectionIndex = ref(0);
  },
})
</script>

<style scoped>

</style>