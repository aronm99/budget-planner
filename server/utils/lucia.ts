import { PrismaClient } from "@prisma/client";
import { UserSchema, lucia } from "lucia";
import { h3 } from "lucia/middleware";
import { prisma } from "@lucia-auth/adapter-prisma";

import { google } from "@lucia-auth/oauth/providers";

const client = new PrismaClient();

// expect error (see next section)
export const auth = lucia({
	env: process.dev ? "DEV" : "PROD",
	middleware: h3(),
  adapter: prisma(client,{
		user: 'user',
		session: 'userSession',
		key: 'userKey',
	}),
  getUserAttributes: (data: UserSchema) => {
		return {
			id: data.id,
			name: data.name,
			email: data.email,
			
		};
	}
});

const runtimeConfig = useRuntimeConfig();

export const googleAuth = google(auth, {
	clientId: runtimeConfig.googleClientId,
	clientSecret: runtimeConfig.googleClientSecret,
	redirectUri: runtimeConfig.googleRedirectUri,
});

export type Auth = typeof auth;