import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";

export async function GET() {
	const session = await getServerSession(authOptions);
	if (!session || !session.user) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
		});
	}

	try {
		await connectDB();
		const notifications = await Notification.find({
			userId: session.user.id,
		}).sort({ createdAt: -1 });
		return new Response(JSON.stringify(notifications), { status: 200 });
	} catch {
		return new Response(JSON.stringify({ error: "Server error" }), {
			status: 500,
		});
	}
}
