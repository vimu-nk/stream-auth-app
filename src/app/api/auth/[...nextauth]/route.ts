import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

const handler = NextAuth({
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				identifier: { label: "Email or Phone", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.identifier || !credentials?.password) {
					throw new Error("Missing credentials");
				}

				await connectDB();

				// Check if identifier is an email or phone
				const isEmail = credentials.identifier.includes("@");
				const user = await User.findOne(
					isEmail
						? { email: credentials.identifier }
						: { phone: credentials.identifier }
				);

				if (!user) {
					throw new Error("Invalid credentials");
				}

				const isMatch = await bcrypt.compare(
					credentials.password,
					user.password
				);

				if (!isMatch) {
					throw new Error("Invalid credentials");
				}

				if (!user.isVerified) {
					throw new Error("Phone not verified");
				}

				// Return user data that should be stored in the session
				return {
					id: user._id.toString(),
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					uniqueId: user.uniqueId || user._id.toString(),
					verificationLevel: user.verificationLevel || 0,
				};
			},
		}),
	],
	session: {
		strategy: "jwt",
		maxAge: 24 * 60 * 60, // 24 hours
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.user = user;
			}
			return token;
		},
		async session({ session, token }) {
			session.user = token.user as typeof session.user;
			return session;
		},
	},
	pages: {
		signIn: "/login",
		error: "/login",
	},
});

export { handler as GET, handler as POST };
