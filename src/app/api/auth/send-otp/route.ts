import { connectDB } from "@/lib/mongodb";
import { Otp } from "@/models/Otp";
import { User } from "@/models/User";
import { sendOTP } from "@/lib/sendSMS";

export async function POST(req: Request) {
	try {
		const { phone } = await req.json();
		await connectDB();

		const existingUser = await User.findOne({ phone });

		if (existingUser) {
			return new Response(
				JSON.stringify({ error: "Phone already registered" }),
				{ status: 400 }
			);
		}

		const code = Math.floor(100000 + Math.random() * 900000).toString();

		await Otp.deleteMany({ phone });
		await Otp.create({
			phone,
			code,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000),
			attempts: 0,
			lastSentAt: new Date(),
		});

		await sendOTP(
			phone,
			`Your verification code is ${code}`,
			Math.floor(Math.random() * 1e12)
		);
		return new Response(JSON.stringify({ message: "OTP sent" }), {
			status: 200,
		});
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error sending OTP:", error.message);
		} else {
			console.error("Error sending OTP:", error);
		}
		return new Response(JSON.stringify({ error: "Failed to send OTP" }), {
			status: 500,
		});
	}
}
