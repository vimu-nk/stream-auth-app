import NextAuth from "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			email?: string;
			phone?: string;
			firstName?: string;
			uniqueId?: number;
		};
	}

	interface User {
		id: string;
		email?: string;
		phone?: string;
		firstName?: string;
		uniqueId?: number;
	}
}
