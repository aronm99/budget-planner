<template>
  <v-sheet max-width="500" class="align-self-center ma-auto d-flex flex-column align-center w-75">
    <v-row class="w-100">
      <v-col class="text-center">
        <span class="text-h3 pa-3">Login</span>
      </v-col>
    </v-row>
    <v-row class="w-100 pt-5 text-center">
      <v-btn href="/api/login/google" width="100%" color="#5865f2" prepend-icon="mdi-google">Login with Google</v-btn>
    </v-row>

    <v-row class="w-100 py-5">
      <v-col>
        <v-divider class="my-5 w-100 border-opacity-50"/>
      </v-col>
      <v-col class="d-flex align-self-center flex-grow-0 px-5">
        <span>or</span>
      </v-col>
      <v-col>
        <v-divider class="my-5 w-100 border-opacity-50"/>
      </v-col>
    </v-row>

    <v-row class="w-100">
      <v-sheet class="w-100">
        <v-form v-model="isValid" validate-on="blur" fast-fail @submit.prevent="handleSubmit">
    
          <v-text-field
            v-model="formData.email"
            label="Email"
            :rules="emailRules"
          />
    
          <v-text-field
            v-model="formData.password"
            label="Password"
            type="password"
          />
          <v-btn type="submit" block class="mt-2">Login</v-btn>
        </v-form>
      </v-sheet>
    </v-row>
  </v-sheet>
</template>

<script lang="ts" setup>
  import { useUser } from '../composables/auth';
  
  const isValid = ref(false);
  const isLoading = ref(false);

  const formData = ref({
    email: '',
    password: '',
  });

  const emailRules = [
    (v: string) => !!v || 'E-mail is required',
    (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
  ];

  const user = useUser();
  if (user.value) {
    await navigateTo("/"); // redirect to profile page
  }

  definePageMeta({
    layout: 'blank',
  });

  const handleSubmit = async (e: Event) => {
    isLoading.value = true;
    await $fetch("/api/login", {
      method: "POST",
      body: formData.value,
      redirect: "manual" // ignore redirect responses
    });
    isLoading.value = false;
    await navigateTo("/");
  };
</script>
