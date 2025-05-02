import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import { connectDB } from "./mongodb";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				identifier: {},
				password: {},
			},
			async authorize(credentials) {
				await connectDB();
				const { identifier, password } = credentials!;
				const user = await User.findOne({
					$or: [{ email: identifier }, { phone: identifier }],
				});

				if (
					!user ||
					!user.isVerified ||
					!(await bcrypt.compare(password, user.password))
				) {
					throw new Error("PHONE_NOT_VERIFIED");
				}

				return {
					id: user._id.toString(),
					email: user.email,
					uniqueId: user.uniqueId,
					verificationLevel: user.verificationLevel,
					firstName: user.firstName,
				};
			},
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 60 * 60 * 3, // 1 hour
	},
	jwt: {
		maxAge: 60 * 60 * 3, // 1 hour
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.uniqueId = user.uniqueId ?? null;
				token.verificationLevel = user.verificationLevel ?? 0;
				token.firstName = user.firstName ?? "";
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.uniqueId = token.uniqueId as number;
				session.user.verificationLevel =
					token.verificationLevel as number;
				session.user.firstName = token.firstName as string;
			}
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
	pages: { signIn: "/login" },
};
