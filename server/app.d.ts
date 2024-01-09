/// <reference types="lucia" />
declare namespace Lucia {
	type Auth = import("./utils/lucia").Auth;
	type DatabaseUserAttributes = {
		pId: number | null;
		name: string | null;
		email: string | null;
		profileImage: string | null;
	};
	type DatabaseSessionAttributes = {};
}