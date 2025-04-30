import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

async function generateUniqueId(): Promise<number> {
	let uniqueId;
	let exists = true;
	do {
		uniqueId = Math.floor(1000000 + Math.random() * 9000000);
		exists = await User.exists({ uniqueId });
	} while (exists);
	return uniqueId;
}

export async function POST(req: Request) {
	try {
		const {
			phone,
			firstName,
			lastName,
			alYear,
			nic,
			gender,
			birthday,
			whatsapp,
			uAddress,
			mapAddress,
			district,
			email,
			password,
		} = await req.json();

		await connectDB();

		const existingPhone = await User.findOne({ phone });
		const existingEmail = await User.findOne({ email });
		const uniqueId = await generateUniqueId();

		if (existingPhone) {
			return new Response(
				JSON.stringify({ error: "Phone already registered" }),
				{ status: 400 }
			);
		}

		if (existingEmail) {
			return new Response(
				JSON.stringify({ error: "Email already registered" }),
				{ status: 400 }
			);
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const user = await User.create({
			uniqueId,
			phone,
			firstName,
			lastName,
			alYear,
			nic,
			gender,
			birthday: new Date(birthday),
			whatsapp,
			uAddress,
			mapAddress,
			district,
			email,
			password: hashedPassword,
			isVerified: true,
			verificationLevel: 1,
		});

		return new Response(
			JSON.stringify({ message: "Registration completed successfully" }),
			{ status: 200 }
		);
	} catch (err: any) {
		console.error(err);
		return new Response(JSON.stringify({ error: "Server Error" }), {
			status: 500,
		});
	}
}
