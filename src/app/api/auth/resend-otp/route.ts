import { connectDB } from "@/lib/mongodb";
import { Otp } from "@/models/Otp";
import { User } from "@/models/User";
import { sendOTP } from "@/lib/sendSMS";

export async function POST(req: Request) {
	const { phone } = await req.json();

	if (!phone) {
		return new Response(
			JSON.stringify({ error: "Phone number is required" }),
			{ status: 400 }
		);
	}

	await connectDB();

	const user = await User.findOne({ phone });
	if (!user) {
		return new Response(JSON.stringify({ error: "User not found" }), {
			status: 404,
		});
	}

	if (user.isVerified) {
		return new Response(
			JSON.stringify({ error: "User already verified" }),
			{ status: 400 }
		);
	}

	const existingOtp = await Otp.findOne({ phone });

	// Block if 3 attempts already made and within 24h
	const now = new Date();
	const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

	if (existingOtp) {
		if (
			existingOtp.attempts >= 3 &&
			existingOtp.createdAt > twentyFourHoursAgo
		) {
			return new Response(
				JSON.stringify({
					error: "Maximum resend attempts reached. Try again in 24 hours.",
				}),
				{ status: 429 }
			);
		}

		const lastSentAt = new Date(existingOtp.lastSentAt);
		const secondsSinceLastSent =
			(now.getTime() - lastSentAt.getTime()) / 1000;

		if (secondsSinceLastSent < 30) {
			return new Response(
				JSON.stringify({
					error: "Please wait before requesting another OTP.",
				}),
				{ status: 429 }
			);
		}
	}

	const code = Math.floor(100000 + Math.random() * 900000).toString();
	const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
	const transactionId = Math.floor(Math.random() * 1e12);

	// Update existing or create new OTP
	await Otp.findOneAndUpdate(
		{ phone },
		{
			code,
			expiresAt,
			lastSentAt: now,
			$inc: { attempts: 1 },
			$setOnInsert: { createdAt: now },
		},
		{ upsert: true, new: true }
	);

	await sendOTP(phone, `Your verification code is ${code}`, transactionId);

	return new Response(
		JSON.stringify({ message: "OTP resent successfully" }),
		{ status: 200 }
	);
}
