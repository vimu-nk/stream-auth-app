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
				const user = await User.findOne({
					$or: [
						{ email: credentials.identifier },
						{ phone: credentials.identifier },
					],
				});
				if (!user || !(await bcrypt.compare(credentials.password, user.password))) {
					throw new Error("Invalid credentials");
				}
				return { id: user._id.toString(), email: user.email };
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,
	session: { strategy: "jwt" },
	callbacks: {
		async jwt({ token, user }) {
			if (user) token.id = user.id;
			return token;
		},
		async session({ session, token }) {
			session.user = { id: token.id as string };
			return session;
		},
	},
	pages: {
		signIn: "/login",
		error: "/login",
	},
});

export { handler as GET, handler as POST };
