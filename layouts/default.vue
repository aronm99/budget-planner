<template>
  <v-app id="inspire">
    <v-navigation-drawer
      :rail="rail"
    >
      <v-list class="d-flex flex-column h-screen">
        <v-list-item
          :prepend-icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          @click="toggleRail"
        />

        <v-list-item
          link
          prepend-icon="mdi-home"
          title="Home"
          @click="navigateTo('/')"
        />
        <v-list-item
          link
          prepend-icon="mdi-plus"
          title="Add Transaction"
          @click="navigateTo('/new-transaction')"
        />

        <v-divider class="mt-auto"/>
        <v-list-item>
          <v-list-item-icon v-if="rail">
            <v-btn
              :icon="themeVal === 'light' ? 'mdi-weather-night' : 'mdi-weather-sunny'"
              rounded="0"
              block
              @click="onThemeButtonClick"
            />
          </v-list-item-icon>
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
          </template>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar>
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

const themeVal  = ref(theme.global.name.value);
const rail = ref(false);


const toggleTheme = () => {
  console.log('onThemeToggle', themeVal.value);
  theme.global.name.value = themeVal.value;
};

const onThemeButtonClick = () => {
  themeVal.value = themeVal.value === 'light' ? 'dark' : 'light';
  toggleTheme();
};

const toggleRail = () => {
  console.log('onRailToggle');
  rail.value = !rail.value;
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

