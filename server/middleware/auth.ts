import { auth } from "../utils/lucia";

export default defineEventHandler(async (event) => {
  const authRequest = auth.handleRequest(event);
	const session = await authRequest.validate();
  event.context.user = session?.user ?? null;
})