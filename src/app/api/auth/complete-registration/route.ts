import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

async function generateUniqueId(): Promise<number> {
	let uniqueId;
	let exists = true;
	do {
		uniqueId = Math.floor(1000000 + Math.random() * 9000000);
		exists = (await User.exists({ uniqueId })) !== null;
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
			institute, // Add this field
			medium, // Add this field
		} = await req.json();

		await connectDB();

		// Check if the phone number is already registered
		const existingPhone = await User.findOne({ phone });
		if (existingPhone) {
			return new Response(
				JSON.stringify({ error: "Phone already registered" }),
				{ status: 400 }
			);
		}

		// Generate a unique ID for the user
		const uniqueId = await generateUniqueId();

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create the user in the database
		await User.create({
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
			institute, // Save this field
			medium, // Save this field
		});

		return new Response(
			JSON.stringify({ message: "Registration completed successfully" }),
			{ status: 200 }
		);
	} catch {
		return new Response(JSON.stringify({ error: "Server Error" }), {
			status: 500,
		});
	}
}
