import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: Request) {
	await connectDB();
	const { email } = await req.json();

	if (!email) {
		return new Response(JSON.stringify({ error: "Email is required" }), {
			status: 400,
		});
	}

	const existingUser = await User.findOne({ email });
	if (existingUser) {
		return new Response(
			JSON.stringify({ error: "Email is already registered" }),
			{ status: 400 }
		);
	}

	return new Response(JSON.stringify({ message: "Email is available" }), {
		status: 200,
	});
}
