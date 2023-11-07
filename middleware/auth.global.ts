import { User } from "lucia";
import { useUser } from "~/composables/auth";

// paths to ignore when redirecting to login page
const unprotectedPages = ["/login", "/signup"];

export default defineNuxtRouteMiddleware(async (to, from) => {
	const user = useUser();
	const { data, error } = await useFetch("/api/user");
	if (error.value) throw createError("Failed to fetch data");
	// set the user for the current session
	user.value = data.value?.user ?? null;

	// redirect to login page if user is not authenticated for protected pages
	if (unprotectedPages.includes(to.path)) return;
	if (!user.value) return navigateTo("/login");
});
