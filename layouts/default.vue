<template>
  <v-app id="inspire">
    <v-navigation-drawer
      :rail="rail"
    >
      <v-list class="d-flex flex-column h-screen">
        <v-list-item
          link
          prepend-icon="mdi-home"
          title="Home"
          @click="navigateTo('/')"
        />
        <v-list-item
          link
          prepend-icon="mdi-file"
          title="Add Bill/Statement"
          @click="navigateTo('/add-statement')"
        />
        <v-list-item
          link
          prepend-icon="mdi-plus"
          title="Add Transaction"
          @click="navigateTo('/new-transaction')"
        />

        <v-divider class="mt-auto"/>
        <v-list-item
          :prepend-icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          @click="toggleRail"
        />
        <v-list-item
          :link="rail"
        >
          <template v-if="rail" v-slot:prepend>
            <v-icon
              @click="onThemeButtonClick"
              :icon="themeVal === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'"
            />
          </template>
          <v-switch
            v-if="!rail"
            hide-details
            v-model="themeVal"
            true-value="light"
            false-value="dark"
            true-icon="mdi-weather-night"
            false-icon="mdi-weather-sunny"
            :color="themeVal === 'dark' ? 'grey-lighten-5' : 'grey-darken-4'"
            inset
            @update:model-value="toggleTheme"
          />
        </v-list-item>
        
        <v-list-item
          :prepend-avatar="user.profilePicture ?? undefined"
          :title="user.name ?? undefined"
          :subtitle="user.email ?? undefined"
        >
          <template v-slot:append>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  variant="text"
                  icon="mdi-dots-vertical"
                  v-bind="props"
                ></v-btn>
              </template>
              <v-list>
                <v-list-item @click="menuItemClicked('Profile')">
                  <template v-slot:prepend>
                    <v-icon>mdi-account</v-icon>
                  </template>
                  <v-list-item-title>Profile</v-list-item-title>
                </v-list-item>

                <v-list-item @click="menuItemClicked('Settings')">
                  <template v-slot:prepend>
                    <v-icon>mdi-cog</v-icon>
                  </template>
                  <v-list-item-title>Settings</v-list-item-title>
                </v-list-item>

                <v-list-item @click="menuItemClicked('Logout')">
                  <template v-slot:prepend>
                    <v-icon>mdi-logout</v-icon>
                  </template>
                  <v-list-item-title>Logout</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-title>{{PageTitle}}</v-app-bar-title>
    </v-app-bar>
    
    <v-main>
      <v-sheet class="pa-4">
        <slot />
      </v-sheet>
    </v-main>
  </v-app>
</template>
<script setup lang="ts">

import { ref } from 'vue'
import { useTheme } from 'vuetify'

const theme = useTheme();
const user = useAuthenticatedUser();

const themeVal  = ref(theme.global.name.value);
const rail = ref(true);

const PageTitle = ref('Home');

const toggleTheme = () => theme.global.name.value = themeVal.value;

const onThemeButtonClick = () => {
  themeVal.value = themeVal.value === 'light' ? 'dark' : 'light';
  toggleTheme();
};

const toggleRail = () => rail.value = !rail.value;

const route = useRoute();

watchEffect(() => {
  // Convert route path to title case, removing dashes and slashes
  if (route.path === '/') {
    PageTitle.value = 'Home';
  } else {
    PageTitle.value = route.path
      .split('/')
      .pop()! // Get last segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
});



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
<style scoped lang="scss">
</style>

