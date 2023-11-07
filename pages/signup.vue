<template>
  <v-sheet max-width="500" class="align-self-center ma-auto d-flex flex-column align-center w-75">
    <v-row class="w-100">
      <v-col class="text-center">
        <span class="text-h3 pa-3">Sign Up</span>
      </v-col>
    </v-row>
    <v-row class="w-100 pt-5 text-center">
      <v-btn href="/api/login/google" width="100%" color="#5865f2" prepend-icon="mdi-google">Sign up with Google</v-btn>
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
            v-model="formData.name"
            label="Name"
            :rules="nameRules"
          />
    
          <v-text-field
            v-model="formData.email"
            label="Email"
            :rules="emailRules"
          />
    
          <v-text-field
            v-model="formData.password"
            label="Password"
            type="password"
            :rules="passwordRules"
          />
    
          <v-text-field
            label="Confirm Password"
            type="password"
            :rules="passwordConfirmRules"
          />
    
          <v-checkbox v-model="agreed" :rules="[v => !!v || 'You must agree to continue!']"
            label="I agree with Terms and Conditions" required />
          <v-btn type="submit" block class="mt-2">Submit</v-btn>
        </v-form>
      </v-sheet>
    </v-row>
  </v-sheet>
</template>

<script lang="ts" setup>
  import { VNodeRef } from 'vue';
  import { useUser } from '../composables/auth';

  const isValid = ref(false);
  const agreed = ref(false);

  const formData = ref({
    name: '',
    email: '',
    password: '',
  });

  const loading = ref(false);

  const nameRules = [
    (v: string) => !!v || 'Name is required',
  ];

  const emailRules = [
    (v: string) => !!v || 'E-mail is required',
    (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
  ];

  const passwordRules = [
    (v: string) => !!v || 'Password is required',
    (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
    (v: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!\"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!\"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]+$/.test(v) || 'Password must include uppercase, lowercase, number, and special character',  ];

  const passwordConfirmRules = [
    (v: string) => !!v || 'Password confirmation is required',
    (v: string) => v === formData.value.password || 'Password confirmation must match password',
  ];
  
  const handleSubmit = async (e: SubmitEvent) => {
    // dont submit if form is invalid
    if (!isValid.value || !agreed) return;

    loading.value = true
    if (!(e.target instanceof HTMLFormElement)) return;
    
    await $fetch("/api/signup", {
      method: "POST",
      body: formData.value,
      redirect: "manual" // ignore redirect responses
    });
    await navigateTo("/"); // profile page
    loading.value = false
  };
  
  // if user is already logged in, redirect to home page
  const user = useUser();
  if (user.value) {
    await navigateTo("/"); // redirect to home page
  }
  
  // set the layout to blank so no header/nav bar is shown
  definePageMeta({
    layout: 'blank',
  });

</script>
