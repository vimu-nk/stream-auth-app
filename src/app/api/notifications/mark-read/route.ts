import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";

export async function POST(req: Request) {
	const session = await getServerSession(authOptions);
	if (!session || !session.user) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
		});
	}

	try {
		const { id } = await req.json();
		await connectDB();

		const result = await Notification.updateOne(
			{ _id: id, userId: session.user.id },
			{ $set: { read: true } }
		);

		return new Response(
			JSON.stringify({ success: result.modifiedCount > 0 }),
			{ status: 200 }
		);
	} catch (err) {
		console.error("Error in POST /notifications/mark-read:", err);
		return new Response(JSON.stringify({ error: "Server error" }), {
			status: 500,
		});
	}
}
