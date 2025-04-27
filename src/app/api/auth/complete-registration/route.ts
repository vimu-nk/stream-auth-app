import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

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
			address,
			district,
			email,
			password,
		} = await req.json();

		await connectDB();

		const user = await User.findOne({ phone });

		if (!user) {
			return new Response(JSON.stringify({ error: "User not found" }), {
				status: 404,
			});
		}

		if (!user.isVerified) {
			return new Response(
				JSON.stringify({ error: "Phone not verified yet" }),
				{ status: 400 }
			);
		}

		if (user.verificationLevel && user.verificationLevel >= 1) {
			return new Response(
				JSON.stringify({ error: "Registration already completed" }),
				{ status: 400 }
			);
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		user.firstName = firstName;
		user.lastName = lastName;
		user.alYear = alYear;
		user.nic = nic;
		user.gender = gender;
		user.birthday = new Date(birthday);
		user.whatsapp = whatsapp;
		user.address = address;
		user.district = district;
		user.email = email;
		user.password = hashedPassword;
		user.verificationLevel = 1; // Set as Phone Verified and Registered

		await user.save();

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
