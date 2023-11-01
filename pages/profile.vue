<script lang="ts" setup>
  import { useAuthenticatedUser } from '../composables/auth';
  definePageMeta({
    middleware: ["protected"]
  });

  const user = useAuthenticatedUser();

  const handleSubmit = async (e: Event) => {
    if (!(e.target instanceof HTMLFormElement)) return;

    const formData = new FormData(e.target);
    
    await $fetch("/api/logout", {
      method: "POST",
      body: formData,
      redirect: "manual" // ignore redirect responses
    });
    await navigateTo("/login");
  };
</script>

<template>
	<h1>Profile</h1>
	<p>User id: {{ user.userId }}</p>
	<p>GitHub username: {{ user.githubUsername }}</p>
	<form method="post" action="/api/logout" @submit.prevent="handleSubmit">
		<input type="submit" value="Sign out" />
	</form>
</template>