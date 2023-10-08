<template>
    <v-card text="Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi, ratione debitis quis est labore voluptatibus! Eaque cupiditate minima, at placeat totam, magni doloremque veniam neque porro libero rerum unde voluptatem!" variant="tonal"></v-card>    
</template>
  
<script setup>
import { ref } from 'vue'

const drawer = ref(null)
</script>

<script>
export default {
    data: () => ({ drawer: null }),
}
</script>