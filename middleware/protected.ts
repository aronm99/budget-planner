import { useUser } from "~/composables/auth";

// middleware/protected.ts
export default defineNuxtRouteMiddleware(async () => {
	const user = useUser();
	if (!user.value) return navigateTo("/login");
});
