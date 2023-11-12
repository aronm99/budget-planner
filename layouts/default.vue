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
        <!-- Menu Trigger Button -->
        <v-btn @click="toggleMenu" prepend-icon="" size="large">
          <template v-slot:prepend>
            <v-avatar>
              <v-img v-if="user.profilePicture" :src="user.profilePicture" alt="User Profile" />
            </v-avatar>
          </template>
          {{ user.name }}
        </v-btn>

        <!-- Menu -->
        <v-menu v-model="menu" :position-x="position.x" :position-y="position.y">
          <v-list>
            <v-list-item @click="menuItemClicked('Profile')">
              <v-list-item-icon>
                <v-icon>mdi-account</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Profile</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="menuItemClicked('Settings')">
              <v-list-item-icon>
                <v-icon>mdi-cog</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Settings</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="menuItemClicked('Logout')">
              <v-list-item-icon>
                <v-icon>mdi-logout</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="toggleDrawer"></v-app-bar-nav-icon>

      <v-app-bar-title>Application</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>
<script setup lang="ts">

import { ref } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme();
const user = useAuthenticatedUser();

const drawer = ref(false);
const themeVal  = ref(theme.global.name.value);
const menu = ref(false);
const position = ref({ x: 0, y: 0 });

const toggleTheme = () => theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
const toggleDrawer = () => drawer.value = !drawer.value;
const toggleMenu = (e: MouseEvent) => {
  menu.value = !menu.value;
  position.value.x = e.clientX;
  position.value.y = e.clientY;
};

const menuItemClicked = async (item: string) => {
  switch (item) {
    case 'Profile':
      navigateTo('/profile');
      break;
    case 'Settings':
      navigateTo('/settings');
      break;
    case 'Logout':
      await $fetch("/api/logout", {
        method: "POST",
        body: {},
        redirect: "manual" // ignore redirect responses
      });
      navigateTo("/login");
      break;
  }
};

</script>

