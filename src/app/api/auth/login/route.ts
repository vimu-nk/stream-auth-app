import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
	try {
		const { email, password } = await req.json();

		if (!email || !password) {
			return new Response(
				JSON.stringify({ error: "Missing credentials" }),
				{ status: 400 }
			);
		}

		await connectDB();

		const user = await User.findOne({ email });

		if (!user) {
			return new Response(
				JSON.stringify({ error: "Invalid credentials" }),
				{ status: 401 }
			);
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return new Response(
				JSON.stringify({ error: "Invalid credentials" }),
				{ status: 401 }
			);
		}

		if (!user.isVerified) {
			return new Response(
				JSON.stringify({ error: "Phone not verified" }),
				{ status: 403 }
			);
		}

		// User is valid – you’ll authenticate using NextAuth, not here
		return new Response(JSON.stringify({ message: "Login success" }), {
			status: 200,
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: "Server error" }), {
			status: 500,
		});
	}
}
