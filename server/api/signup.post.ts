import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";

export default defineEventHandler(async (event) => {
	const { name, email, password } = await readBody<{
		name: string;
    email: string;
		password: string;
	}>(event);

  // create user
  try {
		const user = await auth.createUser({
			key: {
				providerId: "email", // auth method
				providerUserId: email.toLowerCase(), // unique id when using "email" auth method
				password // hashed by Lucia
			},
			attributes: {
				name,
        email,
        profileImage: null,
			}
		});
		const session = await auth.createSession({
			userId: user.userId,
			attributes: {}
		});
		const authRequest = auth.handleRequest(event);
		authRequest.setSession(session);
		return sendRedirect(event, "/"); // redirect to home page
	} catch (e) {
		// if the email is already taken, return a 400
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002' && (e.meta?.target as string[]).includes('email')) {
			throw createError({
				message: "Email already taken",
				statusCode: 400
			});
		}
		throw createError({
			message: "An unknown error occurred",
			statusCode: 500
		});
	}
});