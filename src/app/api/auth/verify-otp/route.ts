import { Otp } from "@/models/Otp";
import { User } from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: Request) {
	const { phone, code } = await req.json();
	await connectDB();

	const record = await Otp.findOne({ phone, code });
	if (!record || record.expiresAt < new Date())
		return new Response(
			JSON.stringify({ error: "Invalid or expired OTP" }),
			{ status: 403 }
		);

	await User.updateOne({ phone }, { $set: { isVerified: true } });
	await Otp.deleteMany({ phone });
	return new Response(JSON.stringify({ message: "Phone verified" }), {
		status: 200,
	});
}
