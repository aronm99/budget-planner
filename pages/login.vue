<template>
	<h1>Sign in</h1>
	<a href="/api/login/github">Sign in with GitHub</a>
</template>

<script lang="ts" setup>
  import { useUser } from '../composables/auth';
  
  const user = useUser();
  if (user.value) {
    await navigateTo("/"); // redirect to profile page
  }

  const handleSubmit = async (e: Event) => {
    // ...
  };
</script>
