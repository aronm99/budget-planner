import { User } from "lucia";
import { useUser } from "~/composables/auth";

export default defineNuxtRouteMiddleware(async () => {
	const user = useUser();
	const { data, error } = await useFetch<{ user: User | null }>("/api/user");
	if (error.value) throw createError("Failed to fetch data");
	user.value = data.value?.user ?? null;
});
