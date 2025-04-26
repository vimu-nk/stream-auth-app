import bcrypt from "bcrypt";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Otp } from "@/models/Otp";
import { sendOTP } from "@/lib/sendSMS";

export async function POST(req: Request) {
	const { email, password, phone } = await req.json();
	await connectDB();

	const existingPhone = await User.findOne({ phone });
	if (existingPhone) {
		return new Response(
			JSON.stringify({ error: "Phone number already in use" }),
			{ status: 400 }
		);
	}

	const existingEmail = await User.findOne({ email });
	if (existingEmail) {
		return new Response(JSON.stringify({ error: "Email already in use" }), {
			status: 400,
		});
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const user = await User.create({
		email,
		password: hashedPassword,
		phone,
		isVerified: false,
	});

	const code = Math.floor(100000 + Math.random() * 900000).toString();
	await Otp.deleteMany({ phone });
	await Otp.create({
		phone,
		code,
		expiresAt: new Date(Date.now() + 5 * 60 * 1000),
	});

	await sendOTP(
		phone,
		`Your verification code is ${code}`,
		Math.floor(Math.random() * 1e12)
	);
	return new Response(JSON.stringify({ userId: user._id }), { status: 201 });
}
