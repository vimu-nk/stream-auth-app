import NextAuth from "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			email?: string;
			phone?: string;
			uniqueId?: number;
			verificationLevel?: number;
			firstName?: string;
		};
	}

	interface User {
		id: string;
		email?: string;
		phone?: string;
		uniqueId?: number;
		verificationLevel?: number;
		firstName?: string;
	}
}
