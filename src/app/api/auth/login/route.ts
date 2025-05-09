import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
	try {
		const { identifier, password } = await req.json();

		if (!identifier || !password) {
			return new Response(
				JSON.stringify({ error: "Missing credentials" }),
				{ status: 400 }
			);
		}

		await connectDB();

		// Check if identifier is an email or phone
		const isEmail = identifier.includes("@");
		const user = await User.findOne(
			isEmail ? { email: identifier } : { phone: identifier }
		);

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

		return new Response(JSON.stringify({ message: "Login success" }), {
			status: 200,
		});
	} catch (error) {
		console.error("Error during login:", error);
		return new Response(JSON.stringify({ error: "Server error" }), {
			status: 500,
		});
	}
}
