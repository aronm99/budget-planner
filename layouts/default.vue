<template>
    <v-app id="inspire">
      <v-navigation-drawer v-model="drawer">
        <div class="d-flex flex-column align-center pa-2">
          <v-switch
            class="mt-auto"
            v-model="themeVal"
            true-value="Light"
            false-value="Dark"
            true-icon="mdi-weather-night"
            false-icon="mdi-weather-sunny"
            :color="`${themeVal ? 'grey-lighten-5' : 'grey-darken-4'}`"
            inset
            @update:model-value="toggleTheme"
          />
        </div>
      </v-navigation-drawer>
  
      <v-app-bar>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
  
        <v-app-bar-title>Application</v-app-bar-title>
      </v-app-bar>
  
      <v-main>
        <slot />
      </v-main>
    </v-app>
</template>
<script setup>

import { ref } from 'vue'
import { useTheme } from 'vuetify'

const drawer = ref(null)
const themeVal  = ref(null)

const theme = useTheme()

function toggleTheme () {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}
</script>

<script>
export default {
  data: () => ({ drawer: null, themeVal: null }),
}
</script>
