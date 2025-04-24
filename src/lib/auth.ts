import CredentialsProvider from "next-auth/providers/credentials";
import { AuthOptions } from "next-auth";
import { connectDB } from "./mongodb";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

export const authOptions: AuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: { identifier: {}, password: {} },
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
				)
					return null;
				return {
					id: user._id.toString(),
					email: user.email,
					phone: user.phone,
				};
			},
		}),
	],
	session: { strategy: "jwt" },
	callbacks: {
		async jwt({ token, user }) {
			if (user) Object.assign(token, user);
			return token;
		},
		async session({ session, token }) {
			session.user = token as any;
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
	pages: { signIn: "/login" },
};
