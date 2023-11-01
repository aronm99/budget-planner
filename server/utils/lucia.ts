import { PrismaClient } from "@prisma/client";
import { lucia } from "lucia";
import { h3 } from "lucia/middleware";
import { prisma } from "@lucia-auth/adapter-prisma";

import { github } from "@lucia-auth/oauth/providers";

const client = new PrismaClient();

// expect error (see next section)
export const auth = lucia({
	env: process.dev ? "DEV" : "PROD",
	middleware: h3(),
  adapter: prisma(client),
  getUserAttributes: (data) => {
		return {
			githubUsername: data.username
		};
	}
});

const runtimeConfig = useRuntimeConfig();

export const githubAuth = github(auth, {
	clientId: runtimeConfig.githubClientId,
	clientSecret: runtimeConfig.githubClientSecret
});

export type Auth = typeof auth;